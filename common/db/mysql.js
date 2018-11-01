const config = require("../config");
const utils = require("../utils");
const Engine = require("./engine");
const mysql = require("mysql");

function extendsConn(coMysql, logger) {
    coMysql.beginTransactionAsync = utils.promisify(coMysql.beginTransaction);
    coMysql.commitAsync = utils.promisify(coMysql.commit);
    coMysql.rollbackAsync = utils.promisify(coMysql.rollback);
    coMysql.queryAsync = function(sql, args, ignore) {
        return new Promise((resolve, reject) => {
            this.query(sql, args, function(err, rows) {
                if (err) {
                    if (!ignore) logger.debug(sql, args || "", err);
                    reject(err);
                } else {
                    if (!ignore && config.dev) logger.debug(sql, args || "");
                    resolve(rows);
                }
            });
        });
    };
    utils.promisify(coMysql.query);
    coMysql.SingleSQL = function(sql, args, ignore) {
        if (!sql) return null;
        if (typeof sql.args == "function")
            return this.queryAsync(sql.toString(), sql.args(), ignore);
        if (sql.sql)
            return this.queryAsync(sql.sql, sql.args || args, ignore);
        return this.queryAsync(sql.toString(), args, ignore);
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
        let pms = Promise.resolve();
        if (autoTrans)
            pms = pms.then(() => db.beginTransactionAsync());
        let out = [];
        for (let sql of utils.arr(sqls)) {
            pms = pms.then(() => db.SingleSQL(sql, args, ignore).then(x => out.push(x)));
        }
        if (autoTrans)
            pms = pms.then(
                rows => db.commitAsync().then(() => rows),
                err => db.rollbackAsync().then(() => Promise.reject(err))
            );
        return pms.then(() => out.length > 1 ? out : out[0]);
    };
}

class MysqlEngine extends Engine {
    constructor(config) {
        super();
        this.pool = mysql.createPool(config);
        this.getConn().then(conn => {
            let coMysql = conn.constructor.prototype;
            extendsConn(coMysql, this.log);
            conn.release();
            this.log.info("数据库引擎启动成功");
        }, err => {
            this.log.error("数据库引擎启动失败:", err);
        });
    }

    getConn() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    this.log.error('can\'t connect to DB: ' + err.toString());
                    reject(err);
                } else {
                    if (!conn.SingleSQL) {
                        let coMysql = conn.constructor.prototype;
                        extendsConn(coMysql, this.log);
                    }
                    resolve(conn);
                }
            });
        });
    };
}

module.exports = MysqlEngine;