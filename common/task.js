const Sqlite = require("../common/db/sqlite");
const utils = require("../common/utils");
const config = require("../common/config");
const log = require("../common/log");

class Tasks {
    constructor(max, retry) {
        this.running_tasks = {};
        this.running_max = max || 37;
        this.retry_max = retry || 5;
        this.start = this.start.bind(this);
        this._db = new Sqlite(this.name());
        this.log = log.getLogger(this.constructor.name.replace(/([A-Z][a-z])/g, "-$1").replace(/^-/, "").toLowerCase());
    }
    name() {
        return "db/" + this.constructor.name.replace(/([A-Z][a-z])/g, "_$1").replace(/^_/, "").toLowerCase() + ".db";
    }
    createTable() {
        return this._db.execSQL(`create table if not exists tasks(
			id integer primary key autoincrement,
			type varchar(32) not null,
			params text not null,
			retry int default 0,
			ret text default null,
			err varchar(1024) default null,
			status int default 0,
			start_at bigint not null default 0,
			success_at bigint not null default 0,
			failure_at bigint not null default 0,
			update_at bigint not null default 0,
			create_at timestamp default current_timestamp
		  );`);
    }
    add(type) {
        let params = JSON.stringify(Array.from(arguments).slice(1));
        return this._db.insertNotExist("tasks", { type, params }).id();
    }
    runAt(type, start_at) {
        let params = JSON.stringify(Array.from(arguments).slice(2));
        return this._db.insertNotExist("tasks", { type, params, start_at }).id();
    }
    getTasks(running) {
        let sql = this._db.select("tasks", ["id", "type", "params", "retry"])
            .where("status", "<=", 0)
            .where("start_at", "<=", new Date().getTime())
            .where("retry", "<=", this.retry_max);
        if (running.length) sql.where("id", "not in", running);
        sql.orderBy("update_at");
        sql.limit(this.running_max - running.length);
        return sql;
    }
    clearTasks() {
        return this._db.delete("tasks").where(true);
    }
    stop() {
        this._stop = true;
        return this;
    }
    async start() {
        this._stop = false;
        while (true) {
            let running = Object.keys(this.running_tasks);
            if (running.length < this.running_max) {
                let tasks = [];
                if (!this._stop) {
                    tasks = await this.getTasks(running);
                    if (!(tasks instanceof Array)) {
                        console.log(tasks);
                        this.stop();
                        continue;
                    }
                }
                if (running.length > 0 || tasks.length > 0)
                    this.log.info(`执行中${running.length}个,新增任务${tasks.length}个`);
                for (let task of tasks) this.running_tasks[task.id] = true;
                for (let task of tasks) {
                    let fn = this[task.type];
                    if (typeof fn === "function") {
                        fn.apply(this, JSON.parse(task.params)).then(async (data) => {
                            if (config.dev) this.log.info(`任务#${task.id} ${task.type}(${task.params.slice(1,task.params.length-1)}) 成功`);
                            let cur = new Date().getTime();
                            await this._db.update("tasks", { update_at: cur, success_at: cur, ret: JSON.stringify(data), status: 1 }).where({ id: task.id });
                            delete this.running_tasks[task.id];
                        }).catch(async (err) => {
                            this.log.warn(`任务#${task.id} ${task.type}(${task.params.slice(1,task.params.length-1)}) 失败:${err.status||err}`);
                            let cur = new Date().getTime();
                            await this._db.update("tasks", { update_at: cur, failure_at: cur, err: err.toString(), retry: task.retry + 1, status: 0 }).where({ id: task.id });
                            delete this.running_tasks[task.id];
                        });
                    } else {
                        this.log.info(`${this.constructor.name} 找不到fn<${task.type}>`);
                        delete this.running_tasks[task.id];
                    }
                }
            }
            // let stop = true;
            // for (let k in this.running_tasks) {
            //     stop = false;
            //     break;
            // }
            // if (stop) break;
            await utils.sleep(1e3);
        }
        this.log.info(this._stop ? "任务已终止" : "任务全部完成");
    }
}

module.exports = Tasks;