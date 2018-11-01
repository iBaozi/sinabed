const net = require("net");
const Duplex = require('stream').Duplex;
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const URL = require('url');
const formidable = require('formidable');
const querystring = require('querystring');
const express = require('express');
const sharp = require('sharp');
const jsqr = require('./jsqr/jsQR');
const readline = require('readline');

exports.cross = function(req, res, next) {
    const origin = req.headers["origin"];
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        // res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "content-type");
    }
    next();
};

exports.formdata = function(dir) {
    let form = new formidable.IncomingForm();
    form.uploadDir = dir;
    form.keepExtensions = true; //保留后缀
    form.multiples = true; //支持多文件上传
    // form.hash = 'md5';
    return function(req, res, next) {
        if (/multipart\/form-data;\s*boundary/i.test(req.headers['content-type'])) {
            form.parse(req, function(err, fields, files) {
                req.fields = fields;
                req.files = files;
                next();
            });
        } else {
            next();
        }
    };
};

/**
 * 检查端口是否占用
 * @param {number} port 端口
 */
exports.probe = function(port) {
    return new Promise(function(resolve) {
        var server = net.createServer().listen(port);

        var calledOnce = false;

        var timeoutRef = setTimeout(function() {
            calledOnce = true;
            resolve(true);
        }, 2000);

        server.on('listening', function() {
            clearTimeout(timeoutRef);

            if (server)
                server.close();

            if (!calledOnce) {
                calledOnce = true;
                resolve(false);
            }
        });

        server.on('error', function(err) {
            clearTimeout(timeoutRef);

            var result = false;
            if (err.code === 'EADDRINUSE')
                result = true;

            if (!calledOnce) {
                calledOnce = true;
                resolve(result);
            }
        });
    });
};

/**
 * @param {string} query
 * @param {string} def
 * @returns {Promise<string>}
 */
exports.readline = function(query, def) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        rl.question((query || '') + (def ? `(${def})` : ''), answer => {
            rl.close();
            resolve(answer || def || '');
        });
    });
};

exports.streamToBuffer = function(stream) {
    return new Promise((resolve, reject) => {
        let buffers = [];
        stream.on('error', reject);
        stream.on('data', (data) => buffers.push(data));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
};

exports.bufferToStream = function(buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
};

exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 按顺序执行Promise
 * @param {Array<(ret:Any,i:Number)=>Promise>} tasks 
 * @param {Any} [init]
 * @returns {Promise}
 */
exports.flow = function(tasks, init) {
    return new Promise((resolve, reject) => {
        var i = 0;
        var ret = init;

        function next(data) {
            ret = data;
            i++;
            if (i < tasks.length)
                tasks[i](ret, i).then(next, reject).catch(reject);
            else
                resolve(ret);
        }
        tasks[i](ret, i).then(next, reject).catch(reject);
    });
};

/**
 * 把v转换为mysql可以接收的参数，把对象转换成json字符串
 * @param {any} v 值
 * @returns {String}
 */
exports.val = function(v) {
    if (v === undefined) v = null;
    return (v && typeof v === "object") ? JSON.stringify(v) : v;
};

/**
 * 如果args为undefined则返回 def||[] 
 * 如果args是一个Array则返回自己
 * 如果不是则返回[args]
 * @param {any} args 
 * @param {Array|undefined} def 默认值
 * @returns {Array}
 */
exports.arr = function(args, def) {
    if (args instanceof Array) return args;
    return args === undefined ? def || [] : [args];
};

exports.clearNull = function(obj) {
    let data = {};
    for (let k in obj) {
        let v = obj[k];
        if (v != undefined)
            data[k] = v;
    }
    return data;
};

exports.ifnull = function(v, def) {
    return v == null ? def : v;
};

/**
 * @param {Array<Function>} middles 
 * @param {Function} cb 
 */
exports.withMiddles = function(context, middles, cb) {
    return function() {
        let args = Array.from(arguments);
        if (cb) middles = middles.concat([cb]);
        let fn = middles.map(x => (next) => x.apply(context, args.concat(next))).reverse().reduce((a, b) => () => b(a));
        return fn();
    };
};

exports.promisify = function(fn) {
    return function() {
        let args = arguments;
        let that = this;
        return new Promise(function(resolve, reject) {
            fn.apply(that, Array.from(args).concat(function(err, data) {
                if (err) reject(err);
                else resolve(data);
            }));
        });
    };
};

/**
 * 深度优先遍历
 * @param {array|object} data 要遍历的数据
 * @param {(data:array|object,ctx:any)=>boolean} fn 对于每个节点回调函数,返回true时终止该节点的遍历
 * @param {string} [key] 子节点属性名
 * @param {any} [ctx] 
 */
exports.dfs = function(data, fn, key, ctx) {
    if (!data) return;
    ctx = ctx || {};
    if (data instanceof Array) {
        for (var i = 0; i < data.length; i++)
            exports.dfs(data[i], fn, key, { key: i, parent: ctx.parent });
        return;
    }
    ctx.node = data;
    if (fn(data, ctx)) return;
    if (key) exports.dfs(data[key], fn, key, { key: key, parent: ctx });
    else if (typeof data === "object")
        for (var k in data)
            exports.dfs(data[k], fn, key, { key: k, parent: ctx });
};

/**
 * 孩子优先 深度优先遍历
 * @param {array|object} data 要遍历的数据
 * @param {(data:array|object,ctx:any)=>boolean} fn 对于每个节点回调函数,返回true时终止该节点的遍历
 * @param {string} [key] 子节点属性名
 * @param {any} [ctx] 
 */
exports.cf_dfs = function(data, fn, key, ctx) {
    if (!data) return;
    ctx = ctx || {};
    if (data instanceof Array) {
        for (var i = 0; i < data.length; i++)
            exports.dfs(data[i], fn, key, { key: i, parent: ctx.parent });
        return;
    }
    ctx.node = data;
    if (key) exports.dfs(data[key], fn, key, { key: key, parent: ctx });
    else if (typeof data === "object")
        for (var k in data)
            exports.dfs(data[k], fn, key, { key: k, parent: ctx });
    fn(data, ctx);
};

/**
 * @param {String} cookie 
 * @returns {Object}
 */
exports.parseResCookie = function(cookie) {
    const KEYS = {
        domain: true,
        name: true,
        value: true,
        path: true,
        expires: true,
        httponly: true,
        secure: true,
        samesite: true,
        size: true,
        session: true,
    };
    let cc = cookie.split(";");
    let ss = cc[0].split("=");
    let item = {};
    item.name = ss[0];
    item.value = ss.slice(1).join("=");
    item.domain = arguments[2];
    for (let row of cc.slice(1)) {
        let ss = row.split("=");
        let name = ss[0].trim().toLowerCase();
        if (KEYS[name]) {
            if (name == 'expires') item[name] = isNaN(ss[1]) ? new Date(ss[1]).getTime() : ss[1];
            else item[name] = ss[1] ? ss[1].trim() : 1;
        }
    }
    return item;
};

/**
 * @param {String} cookie 
 * @returns {Object}
 */
exports.parseReqCookie = function(cookie) {
    if (!cookie) return {};
    let cc = cookie.split(";");
    let item = {};
    for (let s of cc) {
        let ss = s.split("=");
        if (ss.length > 1) {
            item[ss[0].trim()] = ss[1].trim();
        }
    }
    return item;
};

/**
 * 复制一个去掉keys的body对象
 * @param {Object} body 
 * @param {string[]|{}} keys 
 */
exports.clearKeys = function(body, keys) {
    let data = {};
    if (keys instanceof Array) { // 清除keys中的字段
        Object.assign(data, body);
        for (let key of keys) {
            delete data[key];
        }
    } else { // 清除与keys值相同的字段
        for (let k in body) {
            let v = body[k];
            if (keys[k] != v)
                data[k] = v;
        }
    }
    return data;
};

exports.md5 = function(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    return md5sum.digest('hex');
};

/**
 * 签名数据,防止篡改
 * @param {string} sec 密码
 * @param {object} body 签名对象
 * @returns {string} base64 string
 */
exports.signToken = function(sec, body) {
    let str = JSON.stringify(body);
    body.sign = exports.md5(str + sec);
    return new Buffer(JSON.stringify(body)).toString("base64");
};

/**
 * 校验签名并返回数据,校验失败返回undefined
 * @param {string} sec 密码
 * @param {string} token base64 string
 */
exports.checkSign = function(sec, token) {
    try {
        let body = JSON.parse(new Buffer(token, "base64"));
        let sign = body.sign;
        delete body.sign;
        let str = JSON.stringify(body);
        if (sign == exports.md5(str + sec))
            return body;
    } catch (error) {}
};

/**
 * @param {string} host
 * @param {object} req 
 * @param {string} req.url
 * @param {string} [req.method=GET] 
 * @param {{[header: string]: number | string | string[] | undefined}} req.headers
 * @param {any} req.body
 * @param {(proxy_res:http.ServerResponse,next:(res:http.ServerResponse)=>void)=>any} res 
 * @example proxy('http://112.74.23.97:88/', req, res)
 * @example proxy('http://112.74.23.97:88/', req, function(ret){
 * 		return cofs.writeFile('out', ret.data)
 * })
 */
exports.proxy = function(host, req, res) {
    res._sent = true;
    return new Promise((resolve, reject) => {
        let host_url = host ? URL.parse(host) : {};
        let proxy_url = req.url ? URL.parse(req.url) : {};
        let proxy_req = (proxy_url.protocol == 'https:' ? https : http).request({
            hostname: host_url.hostname || proxy_url.hostname,
            port: host_url.port || proxy_url.port,
            path: proxy_url.path || host_url.path,
            method: req.method || "GET",
            headers: req.headers,
        }, function(proxy_res) {
            if (typeof res === 'function') {
                let chunks = [];
                let size = 0;
                proxy_res.on('data', function(chunk) {
                    chunks.push(chunk);
                    size += chunk.length;
                });
                proxy_res.on('end', function() {
                    let data = null;
                    switch (chunks.length) {
                        case 0:
                            data = new Buffer(0);
                            break;
                        case 1:
                            data = chunks[0];
                            break;
                        default:
                            data = new Buffer(size);
                            for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
                                let chunk = chunks[i];
                                chunk.copy(data, pos);
                                pos += chunk.length;
                            }
                            break;
                    }
                    proxy_res.data = data;
                    try {
                        resolve(res(proxy_res, function(res) {
                            res._sent = true;
                            res.writeHead(proxy_res.statusCode, proxy_res.statusMessage, proxy_res.headers);
                            res.write(proxy_res.data);
                            res.end();
                            return proxy_res;
                        }));
                    } catch (error) {
                        reject(error);
                    }
                });
                proxy_res.on('error', reject);
            } else {
                res._sent = true;
                let cookies = proxy_res.headers['set-cookie'];
                if (cookies) {
                    for (let i = 0; i < cookies.length; i++) {
                        cookies[i] = cookies[i].replace(/domain=[^;]*;/g, '');
                    }
                }
                res.writeHead(proxy_res.statusCode, proxy_res.statusMessage, proxy_res.headers);
                proxy_res.pipe(res);
                resolve(proxy_res);
            }
        });
        proxy_req.on('error', reject);
        if (req.readable) {
            req.pipe(proxy_req);
        } else if (req.body) {
            if (typeof req.body === 'string' || req.body instanceof Buffer) {
                proxy_req.write(req.body);
            } else if (req.body.pipe) {
                req.body.pipe(proxy_req);
            } else {
                let type = req.headers["content-type"];
                if (/json/.test(type)) {
                    proxy_req.write(JSON.stringify(req.body));
                } else if (/x-www-form-urlencoded/.test(type)) {
                    proxy_req.write(querystring.stringify(req.body));
                } else {
                    proxy_req.write(req.body);
                }
            }
            proxy_req.end();
        }
    });
};

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {number} update_at 修改时间
 * @param {(modified:Date)} fn 
 */
exports.send304 = function(req, res, update_at, fn) {
    let modtime = new Date(req.headers['if-modified-since'] || 0).getTime();
    if (modtime >= update_at) {
        res._end = true;
        res.writeHead(304);
        res.end('Not Modified');
    } else {
        return fn();
    }
};

/**
 * 
 * @param {express.Response} res 
 * @param {number} update_at 修改时间
 * @param {number} [maxAge=0] 缓存时间
 */
exports.sendCache = function(res, update_at, maxAge) {
    maxAge = maxAge || 0;
    res.removeHeader('Pragma');
    res.writeHead(200, {
        'last-modified': new Date().toUTCString(),
        'cache-control': 'max-age=' + Math.floor(maxAge / 1e3),
        'expires': new Date(update_at + maxAge).toUTCString(),
    });
};

/**** 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 ****/
const CHARS = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
const NUMBERS = '0123456789';

exports.randomString = function(len) {
    var code = '';
    for (var i = 0; i < len; i++) {
        code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return code;
};

exports.randomNumber = function(len) {
    var code = '';
    for (var i = 0; i < len; i++) {
        code += NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length));
    }
    return code;
};

/** 
 * 字串加密
 * @param {String} s
 * @returns {String}
 */
exports.Encrypt = function(s) {
    if (s.length < 2) return s;
    s = new Buffer(encodeURIComponent(s)).toString('base64');
    let s2 = s.substr(s.length - 2);
    s = s.substr(0, s.length - 2);
    let r = Math.floor(Math.random() * s.length);
    let x = r.toString(16);
    return '%' + x.length + s.substr(r) + s.substr(0, r) + x + s2.replace(/=/g, '%');
};

/** 
 * 用于解码Encrypt加密的字串
 * @param {String} s
 * @returns {String}
 */
exports.Decrypt = function(s) {
    if (null == s || String != s.constructor)
        return null;
    if (!s || s[0] != '%') return s;
    let x = parseInt(s.substr(1, 1), 10);
    let s2 = s.substr(-2).replace(/%/g, '=');
    let r = parseInt(s.substr(-2 - x, x), 16);
    let n = s.length - 4 - x;
    s = s.substr(2 + n - r, r) + s.substr(2, n - r) + s2;
    try { x = decodeURIComponent(new Buffer(s, 'base64').toString()); } catch (e) { x = null; }
    return x;
};

/**
 * @param {string} filename
 * @returns {Promise<sharp.SharpInstance>}
 */
exports.qr_decode = function(filename) {
    let img = sharp(filename);
    return img.raw().toBuffer({ resolveWithObject: true }).then(({ data, info: { width, height } }) => {
        img.width = width;
        img.height = height;
        img.qr = jsqr(data, width, height);
        return img;
    });
};