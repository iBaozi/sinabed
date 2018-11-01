const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
const utils = require("./utils");

class Request {
    constructor(url) {
        this.url = url || "http://";
        this.url = this.url.replace(/\/$/, "");
        this._middles = [];
    }
    get option() {
        return {
            timeout: 5e3,
            redirect: 'manual',
            headers: {
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
            }
        };
    }
    use(middle) {
        this._middles.push(middle);
        return this;
    }
    /**
     * 
     * @param {String} url 
     * @param {String} data 
     * @param {String} method 
     * @param {Object} headers 
     */
    request(url, data, method, headers) {
        let option = this.option;
        option.method = method || (data ? "POST" : "GET");
        if (data) option.body = data;
        if (!/https?:\/\//.test(url)) url = this.url + url;
        option.url = url;
        option.headers = Object.assign(option.headers, headers);
        return utils.withMiddles(this, this._middles, function(option) {
            return new Promise((resolve, reject) => {
                fetch(option.url, option).then(resolve).catch(reject);
            });
        })(option).then(res => {
            let type = res.headers.getAll("content-type")[0] || "";
            if (type.indexOf("json") >= 0)
                return res.text();
            else if (type.indexOf("text") >= 0)
                return res.text();
            else
                return res.buffer();
        });
    }
    /**
     * @param {String} uri 
     * @param {Object|String} data 
     * @param {Object} [headers] 
     */
    postForm(uri, data, headers) {
        if (typeof data === "object") {
            let li = [];
            for (let k in data) {
                let v = data[k];
                if (typeof v !== "string") {
                    v = JSON.stringify(v);
                }
                li.push(`${k}=${v}`);
            }
            data = li.join("&");
        }
        return this.request(uri, data, "POST", Object.assign({
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
        }, headers));
    }
    /**
     * @param {String} uri 
     * @param {Object|String} data 
     * @param {Object} [headers] 
     */
    postFile(uri, data, headers) {
        if (!(data instanceof FormData)) {
            let form = new FormData();
            for (let k in data) {
                let v = data[k];
                if (v instanceof fs.ReadStream)
                    form.append(k, v);
                else
                    form.append(k, v);
            }
            data = form;
        }
        return this.request(uri, data, "POST", Object.assign(headers, data.getHeaders()));
    }
    /**
     * @param {String} uri 
     * @param {Object|String} data 
     * @param {Object} [headers] 
     */
    postJson(uri, data, headers) {
        if (typeof data === "object") data = JSON.stringify(data);
        return this.request(uri, data, "POST", Object.assign({
            "content-type": "application/json;charset=UTF-8"
        }, headers));
    }
    /**
     * @param {String} uri 
     * @param {Object|String} [data] 
     * @param {Object} [headers] 
     */
    get(uri, data, headers) {
        if (typeof data === "object") {
            let li = [];
            for (let k in data) {
                let v = data[k];
                li.push(`${k}=${v}`);
            }
            data = li.join("&");
        }
        if (data) uri += (uri.indexOf("?") < 0 ? "?" : "&") + data;
        return this.request(uri, false, "GET", headers);
    }
}

/**
 * 单站点 cookie 中间件
 */
Request.site_cookie = function(option, next) {
    return new Promise((resolve, reject) => {
        option.headers.cookie = option.headers.cookie || this.cookie;
        next().then(res => {
            this.cookie = res.headers.getAll("set-cookie");
            resolve(res);
        }, reject);
    });
};

/**
 * sqlite cookie 中间件
 */
Request.cookie = function(option, next) {
    let cookie = require("./cookie");
    return new Promise((resolve, reject) => {
        cookie.get(option.url).then((data) => {
            option.headers.cookie = option.headers.cookie || data;
            next().then(res => {
                cookie.set(option.url, res.headers.getAll("set-cookie"));
                return res;
            }).then(resolve).catch(reject);
        });
    });
};

/**
 * 使用 http 代理中间件
 */
Request.http_agent = function(option, next) {
    const HttpAgent = require("http-proxy-agent");
    const db = require("./db");
    let sql = db.select("agent").where({ type: 0 }).where("status", ">", 0);
    if (option.url.startsWith("https")) sql.where({ https: 1 });
    return sql.clone().count().then(function(row) {
        let n = Math.floor(Math.random() * (row.count + 1));
        return sql.limit(n, 1).first();
    }).then(function(agent) {
        if (agent) {
            option.agent = new HttpAgent(`http://${agent.ip}:${agent.port}`);
            return new Promise((resolve, reject) => {
                next().then(resolve, err => reject(`agent from http://${agent.ip}:${agent.port} ${err.status||err}`));
            });
        } else return next();
    });
};

/**
 * 使用 http 代理中间件
 */
Request.ez_agent = function(option, next) {
    const HttpAgent = require("http-proxy-agent");
    if (!Request.ez_agent.r) {
        Request.ez_agent.r = new Request("http://ez.inu1255.cn/api");
    }
    /** @type {Request} */
    let r = Request.ez_agent.r;
    if (Math.random() < 0.3) return next();
    return r.get("/hello/agent", { token: 1 }).then(function(ret) {
        let agent = ret && ret.data;
        if (agent) {
            option.agent = new HttpAgent(`http://${agent.ip}:${agent.port}`);
            return new Promise((resolve, reject) => {
                next().then(resolve, err => reject(`agent from http://${agent.ip}:${agent.port} ${err.status||err}`));
            });
        } else return next();
    }, next);
};

module.exports = Request;