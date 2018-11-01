const sqlite3 = require("sqlite3");
const Engine = require("./engine");
const utils = require("../utils");
const config = require("../config");

function extendsConn(coMysql, logger) {
    coMysql.runAsync = function(sql, args, ignore) {
        return new Promise((resolve, reject) => {
            coMysql.run(sql, args, function(err, rows) {
                if (err) {
                    logger.debug(sql, args || "", err);
                    reject(err);
                } else {
                    if (!ignore && config.dev) logger.debug(sql, args || "");
                    resolve(rows);
                }
            });
        });
    };
    coMysql.allAsync = function(sql, args, ignore) {
        return new Promise((resolve, reject) => {
            coMysql.all(sql, args, function(err, rows) {
                if (err) {
                    logger.debug(sql, args || "", err);
                    reject(err);
                } else {
                    if (!ignore && config.dev) logger.debug(sql, args || "");
                    resolve(rows);
                }
            });
        });
    };
    coMysql.SingleSQL = function(sql, args, ignore) {
        if (!sql) return null;
        if (typeof sql.args == "function") {
            args = sql.args();
            sql = sql.toString();
        } else if (typeof sql != "string") {
            args = sql.args || args;
            sql = sql.sql;
        }
        let ss, calls = [];
        utils.arr(args).forEach((item, i) => {
            if (item instanceof Array) {
                ss = ss || sql.split("?");
                calls.push(function() {
                    if (item.length > 1) {
                        ss.splice(i + 1, 0, Array.from({ length: item.length - 1 }).fill(",").join("?"));
                    }
                    args.splice(i, 1, ...item);
                });
            }
        });
        if (ss) {
            while (calls.length) {
                let fn = calls.pop();
                fn();
            }
            sql = ss.join("?");
        }
        if (/^\s*select/i.test(sql))
            return this.allAsync(sql, args, ignore);
        return this.runAsync(sql, args, ignore);
    };
    coMysql.execSQL = function(sqls) {
        let db = this;
        let autoTrans = sqls instanceof Array && sqls.length > 1;
        let ignore = false;
        let args = [];
        for (let x of arguments) {
            if (x === sqls || null == x)
                continue;
            if (x instanceof Array) args = x;
            else ignore = Boolean(x);
        }
        let tasks = [];
        if (autoTrans)
            tasks.push(() => db.runAsync("BEGIN TRANSACTION"));
        tasks.push(() => new Promise((resolve, reject) => {
            utils.flow(utils.arr(sqls).map(sql => () => db.SingleSQL(sql, args, ignore))).then(rows => {
                if (autoTrans)
                    return db.runAsync("COMMIT TRANSACTION").then(() => resolve(rows));
                else
                    resolve(rows);
            }).catch(err => {
                if (autoTrans)
                    db.runAsync("ROLLBACK TRANSACTION").then(() => reject(err)).catch(() => reject(err));
                else
                    reject(err);
            });
        }));
        return utils.flow(tasks);
    };
}

class SqliteEngine extends Engine {
    constructor(name) {
        super();
        this.pool;
        this._filename = name || "sqlite.db";
    }

    getConn() {
        this.getConn.queue = this.getConn.queue || [];
        return new Promise((resolve, reject) => {
            if (this.pool && this.pool.open) resolve(this.pool);
            else if (this.pool) {
                this.getConn.queue.push({ resolve, reject });
            } else {
                this.pool = new sqlite3.Database(this._filename, err => {
                    if (err) {
                        this.log.error("数据库引擎启动失败:", err);
                        reject(err);
                        while (this.getConn.queue.length)
                            this.getConn.queue.pop().reject(err);
                    } else {
                        extendsConn(this.pool, this.log);
                        resolve(this.pool);
                        while (this.getConn.queue.length)
                            this.getConn.queue.pop().resolve(this.pool);
                        this.log.info("数据库引擎启动成功");
                    }
                });
                this.pool.release = function() {};
            }
        });
    };
}

module.exports = SqliteEngine;