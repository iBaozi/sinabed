"use strict";
/**
 * Created Date: 2017-09-28 10:44:28
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const express = require("express");
const router = express.Router();
const fs = require("fs");
const co = require("co");
const path = require("path");
const logger = require("../common/log").getLogger("dev");
const config = require("../common/config");

const apiDir = config.apiDir;

function walkFiles(dir, fn) {
    const files = fs.readdirSync(dir);
    for (let filename of files) {
        filename = path.join(dir, filename);
        let stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            walkFiles(filename, fn);
        } else {
            fn(filename);
        }
    }
}

function paramClean(keys) {
    const km = {};
    for (let k of keys) {
        km[k] = true;
    }
    return function(req, res, next) {
        for (let k in req.body) {
            if (!km[k]) {
                Reflect.deleteProperty(req.body, k);
            }
        }
        next();
    };
}

/**
 * 生成参数验证函数
 * @param {string} k 参数key
 * @param {object} param
 * @param {string} param.lbl 参数名
 * @param {string} param.rem 参数注释
 * @param {boolean} param.need 是否必填
 * @param {any} param.def 默认值
 * @param {Array} param.len 长度限制 [6,32] 6 [0,100]
 * @param {string} param.reg 正则表达式
 */
function paramCheck(k, param) {
    const rem = param.rem;
    const need = param.need;
    const def = param.def;
    const lbl = param.lbl || rem;
    const enu = param.enum;
    const typ = param.type;
    let reg = param.reg;
    let len = param.len;
    let range = param.range;
    if (need || def || len || reg || enu || typ) {
        const name = k + (lbl ? `(${lbl})` : "");
        if (len)
            len = Array.isArray(len) ? len : [len];
        if (range)
            range = Array.isArray(range) ? range : [range];
        if (reg) {
            try {
                reg = new RegExp(reg);
            } catch (error) {
                reg = null;
                logger.error(error);
            }
        }

        function fn(body) {
            let value = body[k];
            if (def != null && value == null) {
                body[k] = def;
                return;
            }
            if (value == null) {
                if (need) {
                    return `${name}是必填项`;
                }
            } else {
                if (typ && value != null) {
                    switch (typ) {
                        case "int":
                            value = +value;
                            if (isNaN(value))
                                return `${name}必须是整数`;
                            body[k] = Math.floor(value);
                            break;
                        case "array":
                            if (typeof value !== "object") {
                                try {
                                    value = body[k] = JSON.parse(value);
                                } catch (error) {
                                    return `${name}类型必须是array`;
                                }
                            }
                            if (!(value instanceof Array))
                                return `${name}必须是数组`;
                            break;
                        case "str":
                            if (value && typeof value !== "string") {
                                body[k] = JSON.stringify(value);
                            }
                            break;
                        case "json":
                            if (typeof value !== "object") {
                                try {
                                    value = body[k] = JSON.parse(value);
                                } catch (error) {
                                    return `${name}类型必须是json`;
                                }
                            }
                            if (typeof value !== "object") {
                                return `${name}类型必须是json`;
                            }
                            break;
                        case "file":
                            if (value.constructor.name != 'File') {
                                return `${name}类型必须是file`;
                            }
                            break;
                        case "number":
                        case "object":
                        case "string":
                            if (typeof value !== typ)
                                return `${name}类型必须是${typ}`;
                    }
                }
                if (len && value != null) {
                    if (value.length < len[0]) {
                        return `${name}长度需大于${len[0]}`;
                    }
                    if (len[1] > 0 && value.length > len[1]) {
                        return `${name}长度需小于${len[1]}`;
                    }
                }
                if (range && value != null) {
                    if (value < range[0]) {
                        return `${name}需大于${range[0]}`;
                    }
                    if (typeof range[1] === "number" && value > range[1]) {
                        return `${name}需小于${range[1]}`;
                    }
                }
                if (reg && !reg.test(value)) {
                    return `${name}不满足格式${reg}`;
                }
                if (enu && enu.indexOf(body[k]) < 0) {
                    return `${name}只能的值不在${enu}中`;
                }
            }
        }
        return function(req, res, next) {
            let msg = fn(req.body);
            if (msg) return res.err(400, msg);
            next();
        };
    }
}

/**
 * 生成预处理函数
 * @param {string} condition 条件表达式 $U: 登录用户 $S: 当前会话 $B: POST参数
 */
function pretreatMake(condition) {
    condition = condition.replace(/{([USB])}/g, "$$$1").replace(/{}/g, '$$B');
    return function(req, res, next) {
        try {
            new Function("$B", "$U", "$S", `${condition}`)(req.body, req.session.user, req.session);
        } catch (error) {
            logger.error(`(${condition})`, error);
            return res.err(500, '预处理失败');
        }
        next();
    };
}

/**
 * 生成条件检查函数
 * @param {string} condition 条件表达式 $U: 登录用户 $S: 当前会话 $B: POST参数
 * @param {string} msg 错误信息
 */
function conditionCheck(condition, msg, no) {
    condition = condition.replace(/{([USB])}/g, "$$$1").replace(/{}/g, '$$B');
    return function(req, res, next) {
        if (condition.indexOf("$U") >= 0 && !req.session.user) {
            return res.err(401);
        }
        try {
            if (!new Function("$B", "$U", "$S", `return (${condition})`)(req.body, req.session.user, req.session)) {
                return res.err(no, msg);
            }
        } catch (error) {
            logger.error(`(${condition})`, error);
            return res.err(no, msg);
        }
        next();
    };
}

function conditionChecks(check, no) {
    let checks = [];
    if (check instanceof Array) {
        for (let item of check) {
            if (item && typeof item.R === "string") {
                checks.push(conditionCheck(item.R, item.M, item.no || no));
            } else if (typeof item === "string") {
                checks.push(conditionCheck(item, '', no));
            }
        }
    } else if (check && typeof check.R === "string") {
        checks.push(conditionCheck(check.R, check.M, check.no || no));
    } else if (typeof check === "string") {
        checks.push(conditionCheck(check, '', no));
    } else if (typeof check === "object") {
        for (let k in check) {
            let v = check[k];
            checks.push(conditionCheck(k, v, no));
        }
    }
    return checks;
}

/**
 * 生成 接口失败时返回数据的函数
 * @param {object} error 接口定义中的error
 */
function makeSendErr(error) {
    error = Object.assign({}, config.error, error);
    return function(no, msg) {
        this._end = true;
        if (msg == 404) msg = '';
        this.json({ no, msg: msg || error[no] || "未知错误" });
    };
}

/**
 * 接口成功时返回数据的函数
 * @param {object} data 
 */
function sendOk(data) {
    this._end = true;
    if (typeof data === "number")
        this.err(data);
    else if (data && data.no) {
        this.json(data);
    } else {
        this.json({ no: 200, data });
    }
}

function apiDefine(filename) {
    let text = fs.readFileSync(filename);
    let data = {};
    try {
        data = new Function("return " + text)();
    } catch (error) {}
    if (!data.name) {
        logger.warn("api定义缺少name", filename);
        return;
    }
    let method = data.method;
    if (!method) {
        logger.warn("api定义缺少method", filename);
        return;
    }
    method = method.toLowerCase();
    if (method == '*') method = 'all';
    for (let m of method.split('|')) {
        if (!router[m]) {
            logger.warn("api定义不支持的method", m, filename);
            return;
        }
    }
    // 接口定义没问题
    // 构造参数检查函数
    let checks = [];
    if (data.freq) {
        // 访问频率控制
        let ipMap = {};
        checks.push(function(req, res, next) {
            var now = +new Date;
            var prev = ipMap[req.ip];
            if (prev && prev + data.freq > now) return res.err(500, "操作太频繁");
            ipMap[req.ip] = now;
            next();
        });
    }
    if (data.params) {
        // 清除接口定义中不存在的参数
        checks.push(paramClean(Object.keys(data.params)));
        // 参数检查
        for (let k in data.params) {
            let v = data.params[k];
            let checkFn = paramCheck(k, v);
            if (checkFn) {
                checks.push(checkFn);
            }
        }
    }
    if (data.grant) { // 权限检查
        checks.push(conditionChecks(data.grant, 403));
    }
    if (data.pretreat) { // 预处理
        checks.push(pretreatMake(data.pretreat));
    }
    if (data.check) { // check检查
        checks = checks.concat(conditionChecks(data.check, 400));
    }
    const sendErr = makeSendErr(data.error);
    return { method, checks, sendErr, ret: data.ret };
}

/**
 * 通过json接口文件生成接口并路由
 * @param {string} filename 定义api的json文件
 * @param {function|null} handler 接口实现函数
 */
function routeApi(filename, handler) {
    const data = apiDefine(filename);
    if (!data) {
        return;
    }
    // 构造接口实现函数
    let uri = filename.slice(apiDir.length, -5);
    if (!handler) {
        logger.info("define", data.method.toUpperCase(), uri, "---> Mock数据");
        handler = function(req, res) {
            console.log(data.ret);
            res.json(data.ret || { no: 200 });
        };
    } else {
        logger.info("define", data.method.toUpperCase(), uri);
    }
    let args = [uri];
    // 初始化
    args.push(function(req, res, next) {
        res.err = data.sendErr;
        res.ok = sendOk;
        req.body = Object.assign({}, req.query, req.body, req.fields, req.files);
        req.session = req.session || {};
        next();
    });
    // 参数、权限检查
    for (let fn of data.checks) {
        args.push(fn);
    }
    // 开始路由
    args.push(function(req, res) {
        let ret;
        try {
            if (handler.constructor.name === "GeneratorFunction") {
                ret = co(handler(req, res));
            } else {
                ret = handler(req, res);
            }
        } catch (err) {
            logger.error(err);
            if (!res.finished && !res._end) {
                if (config.dev) res.err(500, err + '');
                else res.err(500, '系统错误');
            }
            return;
        }
        // 返回 promise 则 then
        if (ret && typeof ret.then === "function") {
            ret.then(function(data) {
                if (!res.finished && !res._end) res.ok(data);
            }, function(err) {
                logger.error(err);
                if (!res.finished && !res._end) {
                    if (config.dev) res.err(500, err + '');
                    else res.err(500, '系统错误');
                }
            });
        } else {
            // try {
            if (!res.finished && !res._end) res.ok(ret);
            // } catch (error) {
            //     if (error != "Error: Can't set headers after they are sent.") {
            //         console.log(error);
            //     }
            // }
        }
    });
    for (let method of data.method.split("|")) {
        router[method].apply(router, args);
    }
}

/**
 * 通过api.json文件获取对应的 接口实现函数
 * @param {string} filename 文件名
 */
function getHander(filename) {
    // ./person/login
    let modulePath = "." + filename.slice(apiDir.length, -5);
    // [".","person","login"]
    let ss = modulePath.split(path.sep);
    // login
    let key = ss[ss.length - 1].replace(/[-_]\w/g, a => a[1].toUpperCase());
    // ./person
    modulePath = ss.slice(0, ss.length - 1).join("/");
    if (ss.length == 2) {
        modulePath += "/main";
    }
    var handler;
    try {
        let mod = require(modulePath);
        // console.log(Object.keys(mod), key);
        if (mod && typeof mod[key] === "function")
            handler = mod[key].bind(mod);
    } catch (error) {
        if (error.code == 'MODULE_NOT_FOUND') {
            logger.error(`找不到模块${modulePath}`);
        } else {
            logger.error(error);
        }
    }
    return handler;
}

walkFiles(apiDir, function(filename) {
    if (filename.endsWith(".json")) {
        routeApi(filename, getHander(filename));
    }
});

module.exports = router;