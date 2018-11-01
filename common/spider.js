const db = require("../common/db");
const Request = require("../common/request");
const utils = require("../common/utils");
const config = require("../common/config");
const log = require("../common/log").getLogger("spider");

class Spider {
    constructor(host, max, retry) {
        this.request = host instanceof Request ? host : new Request(host);
        this.running_tasks = {};
        this.running_max = max || 37;
        this.retry_max = retry || 5;
        this.start = this.start.bind(this);
    }
    async add(type, url, params) {
        params = JSON.stringify(params || null);
        return await db.insertNotExist("spiders", { cls: this.constructor.name, url: url || "", type, params }).id();
    }
    async clearTasks() {
        return await db.delete("spiders").where({ cls: this.constructor.name });
    }
    async stop() {
        this._stop = true;
    }
    async start() {
        this._stop = false;
        while (true) {
            let running = Object.keys(this.running_tasks);
            if (running.length < this.running_max) {
                let tasks = [];
                if (!this._stop) {
                    let sql = db.select("spiders", ["id", "url", "type", "params", "retry"]).where({ cls: this.constructor.name }).where("success_at", "<=", 0).where("retry", "<=", this.retry_max);
                    if (running.length) sql.where("id", "not in", running);
                    sql.limit(this.running_max - running.length);
                    tasks = await sql;
                    if (!(tasks instanceof Array)) {
                        console.log(sql + "");
                        console.log(tasks);
                        this.stop();
                        continue;
                    }
                }
                log.info(`执行中${running.length}个,新增任务${tasks.length}个`);
                for (let task of tasks) this.running_tasks[task.id] = true;
                for (let task of tasks) {
                    let fn = this[task.type];
                    if (typeof fn === "function") {
                        fn.apply(this, [task.url, JSON.parse(task.params)]).then(async (data) => {
                             log.info(`任务#${task.id} ${task.type}(${decodeURIComponent(task.url)},${task.params}) 成功`);
                            await db.update("spiders", { success_at: new Date().getTime(), result: JSON.stringify(data) }).where({ id: task.id });
                            delete this.running_tasks[task.id];
                        }).catch(async (err) => {
                            if (config.dev)log.warn(`任务#${task.id} ${task.type}(${decodeURIComponent(task.url)},${task.params}) 失败:${err.status||err}`);
                            await db.update("spiders", { retry: task.retry + 1, error: err.toString() }).where({ id: task.id });
                            delete this.running_tasks[task.id];
                        });
                    } else {
                        log.info(`${this.constructor.name} 找不到fn<${task.type}>`);
                        delete this.running_tasks[task.id];
                    }
                }
            }
            let stop = true;
            for (let k in this.running_tasks) {
                stop = false;
                break;
            }
            if (stop) break;
            await utils.sleep(1e3);
        }
        log.info(this._stop ? "任务已终止" : "任务全部完成");
    }
}

module.exports = Spider;