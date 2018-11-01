"use strict";
const log = require("../log").getLogger("db");
const utils = require("../utils");

/**
 * 用于构建sql的where语句
 */
class WhereBuilder {
    constructor(sql, args) {
        this._keys = utils.arr(sql);
        this._args = utils.arr(args);
    }
    clone() {
        return new WhereBuilder(this._keys, this._args);
    }
    isEmpty() {
        return this._keys.length < 1;
    }
    toString() {
        return this._keys.join(" ").trim();
    }
    toWhere() {
        return this.isEmpty() ? "" : " where " + this;
    }
    /**
     * 获取args: where的参数
     * query("select * from user where name=?", args)
     */
    args() {
        return this._args;
    }
    /**
     * 加括号，将foo=? and bar=?变成(foo=? and bar=?)
     * 之后调用and/or时，会变成(foo=? and bar=?) and/or baz=?
     */
    build() {
        if (this._keys.length > 1) {
            this._keys = ["(" + this._keys.join(" ").trim() + ")"];
        }
        return this;
    }
    /**
     * 使用op拼接两个where语句，wb会加括号
     * foo=? or bar=? 使用and拼接 baz=? or qux=? 变成 foo=? or bar=? and (baz=? or qux=?)
     * 可以先调用build再拼接 变成 (foo=? or bar=?) and (baz=? or qux=?)
     * @param {String} op and/or
     * @param {WhereBuilder} wb 另一个where语句
     */
    concat(op, wb) {
        if (!wb.isEmpty()) {
            if (this._keys.length) this._keys.push(op);
            this._keys.push(wb.build().toString());
            this._args = this._args.concat(wb._args);
        }
        return this;
    }
    /**
     * 参见 Engine.prototype.where 和 this.concat
     * @param {WhereBuilder|String|Array|Object} key 
     * @param {String} op 
     * @param {any} value 
     */
    and(key, op, value) {
        let wb = key instanceof WhereBuilder ? key : Engine.prototype.where(key, op, value);
        return this.concat("and", wb);
    }
    /**
     * 参见 Engine.prototype.where 和 this.concat
     * @param {WhereBuilder|String|Array|Object} key 
     * @param {String} op 
     * @param {any} value 
     */
    or(key, op, value) {
        let wb = key instanceof WhereBuilder ? key : Engine.prototype.where(key, op, value);
        return this.concat("or", wb);
    }
}

class Raw {
    constructor(sql, args) {
        this._sql = sql || "";
        this._args = utils.arr(args);
    }
    toString() {
        return this._sql;
    }
    args() {
        return this._args;
    }
    /**
     * @param {Raw} sql 
     * @returns {string}
     */
    str() {
        let i = 0;
        let args = this.args();
        return this.toString().replace(/\?/g, function() {
            let s = args[i++];
            if (typeof s === "string") return `'${s.replace(/'/g, /\\'/)}'`;
            return s;
        });
    }
    push(args) {
        for (let arg of utils.arr(args))
            this._args.push(arg);
        return this;
    }
    wrapSet(data) {
        let keys = [];
        for (let k in data) {
            let v = data[k];
            if (v === undefined) continue;
            if (v instanceof Raw) {
                keys.push(k + "=(" + v.toString() + ")");
                this.push(v._args);
            } else {
                keys.push(k + "=?");
                this.push(utils.val(v));
            }
        }
        this._sql = keys.join(",");
        return this;
    }
    /**
     * @param {Object} data 
     * @param {Array} [keys] 
     */
    warpValues(data, keys) {
        let values = [];
        if (!keys || !keys.length) keys = Object.keys(keys);
        for (let k in data) {
            let v = data[k];
            if (v === undefined) continue;
            keys.push(k);
            if (v instanceof Raw) {
                values.push(v.toString());
                this.push(v._args);
            } else {
                values.push("?");
                this.push(utils.val(v));
            }
        }
        return `(${values.join(",")})`;
    }
    wrapInsert(data) {
        data = utils.arr(data);
        if (data.length > 0) {
            let keys = [];
            for (let k in data[0]) {
                let v = data[0][k];
                if (v === undefined) continue;
                keys.push(k);
            }
            this._sql = `(${keys.join(",")}) values${this.warpValues(data[0],keys)}`;
            for (let item of data.slice(1)) {
                this._sql += `,${this.warpValues(item,keys)}`;
            }
        }
        return this;
    }
}

class Sql extends Raw {
    constructor(sql, args) {
        super(sql, args);
        this.$$pms;
        this._where = new WhereBuilder();
        this._table = "";
        this._order = "";
        this._limit = "";
    }
    /**
     * @returns {Sql}
     */
    clone() {
        let inst = new this.constructor();
        for (let k in this) {
            if (k.startsWith("_")) {
                let v = this[k];
                inst[k] = typeof v.clone === "function" ? v.clone() : v;
            }
        }
        return inst;
    }
    /**
     * @param {Engine} e 
     */
    engine(e) {
        this._e = e;
        return this;
    }
    toString() {
        return `${this._sql}${this._table}${this._where.toWhere()}${this._order}${this._limit}`;
    }
    args() {
        return this._args.concat(this._where.args());
    }
    $pms() {
        if (this.$$pms) return this.$$pms;
        /** @type {Promise<Array>} */
        return this.$$pms = this.pms();
    }
    pms() {
        return new Promise((resolve, reject) => {
            if (this._where.isEmpty() && (this._sql.startsWith("delete") || this._sql.startsWith("update"))) {
                reject("禁止update/delete不带where语句: " + this.toString());
            } else {
                this._e.SingleSQL(this).then((rows) => {
                    if (this._first) {
                        rows instanceof Array ? resolve(rows[0]) : resolve(rows);
                    } else {
                        if (this._id) {
                            if (rows) {
                                resolve(rows.insertId || this._id);
                            } else {
                                this._e.SingleSQL(`select last_insert_rowid() as id;`).first().then(rows => resolve(rows.id), reject);
                            }
                        } else {
                            resolve(rows);
                        }
                    }
                }, reject);
            }
        });
    }
    then(onfulfilled, onrejected) {
        return this.$pms().then(onfulfilled, onrejected);
    }
    catch (onrejected) {
        return this.$pms().catch(onrejected);
    }
    from(table) {
        this._table = table;
        return this;
    }
    /**
     * @param {String|Object} key 
     * @param {String} [op] 
     * @param {String|Sql} [value] 
     */
    where(key, op, value) {
        this._where.and(key, op, value);
        return this;
    }
    /**
     * @param {String|Object} key 
     * @param {String} [op] 
     * @param {String|Sql} [value] 
     */
    orWhere(key, op, value) {
        this._where.or(key, op, value);
        return this;
    }
    orderBy(key) {
        this._order = key ? ` order by ${key}` : "";
        return this;
    }
    limit(offset, size) {
        offset = +offset;
        size = +size;
        if (size)
            this._limit = ` limit ${offset},${size}`;
        else if (offset)
            this._limit = ` limit ${offset}`;
        else
            this._limit = " limit 1";
        return this;
    }
    first() {
        if (!this._limit) this._limit = " limit 1";
        this._first = true;
        this.then(function(rows) {
            return rows instanceof Array ? rows[0] : rows;
        });
        return this;
    }
    exclude(keys) {
        keys = utils.arr(keys);
        if (keys.length) {
            this.then(function(rows) {
                if (rows instanceof Array) {
                    for (let row of rows) {
                        for (let key of keys) {
                            delete row[key];
                        }
                    }
                } else if (typeof rows === "object") {
                    for (let key of keys) {
                        delete rows[key];
                    }
                }
                return rows;
            });
        }
        return this;
    }
    /**
     * @param {Number} [id]
     */
    id(id) {
        this._id = id || true;
        return this;
    }
}

class InsertSql extends Sql {
    constructor(table, data) {
        super();
        this.from(table);
        this._ignore = "";
        this._data = "";
        this._args = [];
        this.wrapInsert(data);
    }
    ignore() {
        this._ignore = "ignore ";
        return this;
    }
    toString() {
        return `insert ${this._ignore}into ${this._table} ${this._sql}`;
    }
    args() {
        return this._args;
    }
}

class SelectSql extends Sql {
    constructor(table, keys) {
        super();
        keys = utils.arr(keys, ["*"]);
        this._sql = `select ${keys.join(",")} from `;
        this.from(table);
    }
    /**
     * @param {String} [key] 
     */
    count(key) {
        this._sql = `select count(${key||"*"}) as count from `;
        this._first = true;
        return this;
    }
    /**
     * @param {Array} keys 
     */
    select(keys) {
        keys = utils.arr(keys, ["*"]);
        this._sql = `select ${keys.join(",")} from `;
        return this;
    }
}

class UpdateSql extends Sql {
    constructor(table, data) {
        super();
        this.from(table);
        this._data = data;
        this._args = [];
        this.wrapSet(data);
    }
    toString() {
        if (!this._sql) return "";
        return `update ${this._table} set ${this._sql}${this._where.toWhere()}`;
    }
}

class DeleteSql extends Sql {
    constructor(table) {
        super();
        this.from(table);
        this._sql = "delete from ";
    }
}

class InsertNotExist extends Sql {
    constructor(table, data) {
        super();
        this.from(table);
        this._data = data;
    }
    toString() {
        return `insert into ${this._table} (${this.keys}) (select ${this.values} from dual where not exists (select * from ${this._table} ${this._where.toWhere()} limit 1))`;
    }
    pms() {
        return new Promise((resolve, reject) => {
            if (this._where.isEmpty()) this.where(this._data);
            new SelectSql(this._table).engine(this._e).where(this._where).first().then((row) => {
                if (row) {
                    if (this.id) resolve(row.id);
                    else resolve(row);
                } else {
                    let hander = new InsertSql(this._table, this._data).engine(this._e);
                    if (this._id) hander.id(row && row.id);
                    hander.then(resolve, reject);
                }
            }, reject);
        });
    }
}

class InsertOrUpdate extends Sql {
    constructor(table, data, keys) {
        super();
        this.from(table);
        this._data = data;
        if (keys instanceof Array)
            this._keys = keys;
        else {
            this._keys = [];
            for (let k in data) {
                let v = data[k];
                this._keys = keys.push(k);
            }
        }
        this.duplicate = this.getSet();
    }
    toInsert() {
        return new InsertSql(this._table, this._data).engine(this._e);
    }
    getSet() {
        let data = {};
        for (let k of this._keys) {
            data[k] = this._data[k];
        }
        return data;
    }
    toUpdate() {
        return new UpdateSql(this._table, this.getSet()).engine(this._e).where(this._where);
    }
    pms() {
        if (this._where.isEmpty())
            return super.pms();
        return new Promise((resolve, reject) => {
            new SelectSql(this._table).engine(this._e).where(this._where).first().then((row) => {
                let hander = row ? this.toUpdate() : this.toInsert();
                if (this._id) hander.id(row && row.id);
                hander.then(resolve, reject);
            }, reject);
        });
    }
    toString() {
        if (this._where.isEmpty()) {
            return `${new InsertSql(this._table, this._data)} on duplicate key update ${new Raw().wrapSet(this.duplicate)};`;
        }
        return `if(${new SelectSql(this._table).where(this._where).first()}) { ${new UpdateSql(this._table,this._data).where(this._where)} } else { ${new InsertSql(this._table, this._data)} }`;
    }
    args() {
        if (this._where.isEmpty())
            return new InsertSql(this._table, this._data).push(new Raw().wrapSet(this.duplicate).args()).args();
        return new SelectSql(this._table).where(this._where).first().push(new UpdateSql(this._table, this._data).where(this._where).args()).push(new InsertSql(this._table, this._data).args()).args();
    }
    then(onfulfilled, onrejected) {
        return super.then(onfulfilled, onrejected);
    }
}

class Engine {
    constructor() {
        this.log = log;
    }

    get name() {
        return this.constructor.name.replace(/([A-Z][a-z])/g, "-$1").replace(/^-/, "").toLowerCase();
    }

    getConn() {
        throw "需要实现getConn";
    }

    release(conn) {
        conn.release();
    }

    /**
     * @param {String} sql 
     * @param {Array} args 
     * @returns {Promise<Array>}
     */
    SingleSQL(sql, args) {
        return new Promise((resolve, reject) => {
            this.getConn().then(conn => {
                conn.SingleSQL(sql, args).then(rows => {
                    this.release(conn);
                    resolve(rows);
                }, err => {
                    this.release(conn);
                    reject(err);
                });
            }, reject);
        });
    }

    /**
     * @param {String|Sql|Array<String|Sql>} sqls 
     * @param {Array} args 
     * @returns {Promise<Array>}
     */
    execSQL(sqls) {
        let argu = arguments;
        return new Promise((resolve, reject) => {
            this.getConn().then(conn => {
                conn.execSQL.apply(conn, argu).then(rows => {
                    this.release(conn);
                    resolve(rows);
                }, err => {
                    this.release(conn);
                    reject(err);
                });
            }, reject);
        });
    }

    /**
     * 在一个事务中执行
     * @param {{(db:Engine)=>Promise<any>}} fn 
     */
    withTransaction(fn) {
        return this.getConn().then(function(conn) {
            return conn.beginTransactionAsync().then(_ => {
                let db = new Engine();
                db.getConn = _ => Promise.resolve(conn);
                db.release = _ => null;
                return fn(db).then(function(ret) {
                    return conn.commitAsync().then(_ => {
                        conn.release();
                        return Promise.resolve(ret);
                    });
                }, function(err) {
                    return conn.rollbackAsync().then(_ => {
                        conn.release();
                        return Promise.reject(err);
                    });
                });
            });
        });
    }

    /**
     * @param {String} sql 
     * @param {Array} args 
     */
    Raw(sql, args) {
        return new Raw(sql, args);
    }
    /**
     * @param {String} table 
     * @param {String[]} keys 
     */
    select(table, keys) {
        return new SelectSql(table, keys).engine(this);
    }

    insert(table, data) {
        return new InsertSql(table, data).engine(this);
    }

    update(table, data) {
        return new UpdateSql(table, data).engine(this);
    }

    delete(table) {
        return new DeleteSql(table).engine(this);
    }

    insertOrUpdate(table, data, keys) {
        return new InsertOrUpdate(table, data, keys).engine(this);
    }

    insertNotExist(table, data) {
        return new InsertNotExist(table, data).engine(this);
    }

    setLogger(logger) {
        this.log = logger;
    }

    /**
     * 生成一个WhereBuilder
     * where("name","admin")
     * where("name","like","adm%")
     * where({"name":"admin"})
     * where([
     *     ["name","admin"],
     *     ["name","like","adm%"]
     * ])
     * @param {String|Array|Object} key 
     * @param {String} op 
     * @param {any} value 
     */
    where(key, op, value) {
        if (op != undefined && value != undefined) {
            if (value instanceof Raw) return new WhereBuilder(`${key} ${op} (${value})`);
            if (op.indexOf("in") >= 0)
                return new WhereBuilder(`${key} ${op} (?)`, [value]);
            return new WhereBuilder(`${key} ${op} ?`, [utils.val(value)]);
        } else if (op != undefined) {
            if (op instanceof Raw) return new WhereBuilder(`${key}=(${op})`);
            if (op instanceof Array) return new WhereBuilder(key, op);
            op = utils.val(op);
            if (op == null) return new WhereBuilder(`${key} is null`);
            return new WhereBuilder(`${key}=?`, [op]);
        }
        if (key instanceof Array) {
            // console.log("Array", key);
            let wb = new WhereBuilder();
            for (let item of key) {
                wb.and(this.where.apply(null, utils.arr(item)));
            }
            return wb;
        } else if (typeof key === "object") {
            // console.log("object", key);
            let wb = new WhereBuilder();
            for (let k in key) {
                let v = key[k];
                if (typeof v != 'undefined') wb.and(k, v);
            }
            return wb;
        } else if (typeof key === "string") {
            // console.log("string", key);
            return new WhereBuilder(key);
        } else {
            // console.log("other", typeof key, key);
            return new WhereBuilder(key ? "1" : "0");
        }
    };

}

Engine.Raw = Raw;

module.exports = Engine;