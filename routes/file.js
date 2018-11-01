const cofs = require("../common/cofs");
const config = require("../common/config");
const SinaBed = require('../common/sina');
const db = require("../common/db");
const path = require('path');
const utils = require('../common/utils');

/**
 * @param {{session:{user:User}}} req
 */
exports.image = async function(req, res) {
    // gparam "../api/file/image.json"
    /**
     * @typedef {object} image_body
     * @property {string} f 图片
     * @property {number} [qr] 是否二维码
     * @property {string} [token] 身份信息
     * @property {string} [username] 新浪账号
     * @property {string} [passwd] 新浪密码
     */
    /** @type {image_body} */
    let body = req.body;
    if (!body.f.type.startsWith('image/')) return 405;
    let rect, data, buffer;
    if (body.qr) {
        let img = {};
        try {
            img = await utils.qr_decode(body.f.path);
        } catch (err) {
            if (!/unsupported image format/.test(err))
                console.log(err);
        }
        if (img.qr) {
            data = img.qr.data;
            let location = img.qr.location;
            let left = Math.floor(Math.min(location.topLeftCorner.x, location.bottomLeftCorner.x));
            left = Math.max(left, 0);
            let right = Math.floor(Math.max(location.topRightCorner.x, location.bottomRightCorner.x));
            let width = right - left;
            let top = Math.floor(Math.min(location.topLeftCorner.y, location.topRightCorner.y));
            top = Math.max(top, 0);
            let bottom = Math.floor(Math.max(location.bottomRightCorner.y, location.bottomLeftCorner.y));
            let height = bottom - top;
            rect = { left, top, width: Math.min(img.width, width), height: Math.min(img.height, height) };
        } else if (body.qr > 1) return 406;
        if (body.qr > 2) { // 裁剪二维码
            buffer = await img.extract(rect).toFormat('png').toBuffer({ resolveWithObject: false });
        }
    }
    let sina = new SinaBed(body.username || config.sina.username, body.passwd || config.sina.password);
    buffer = buffer || await cofs.readFile(body.f.path);
    cofs.rm(body.f.path);
    let md5 = 'bfdf4e9fgy1fwt3hg92ypj20pu0f30t7';
    // try {
    //     md5 = await sina.upload(buffer.toString('base64'));
    // } catch (err) {
    //     if (err == "pincode") return 407;
    //     console.error(err);
    //     throw err;
    // }
    let url = `https://ws1.sinaimg.cn/mw690/${md5}`;
    let name;
    if (body.f.name.length > 64) {
        let ext = path.extname(body.f.name);
        name = path.basename(body.f.name).slice(0, 32 - ext.length) + ext;
    } else {
        name = body.f.name;
    }
    let row = {
        ip: req.ip,
        ua: req.ua,
        uri: md5,
        name,
        create_at: +new Date(),
    };
    if (data) row.data = data;
    if (body.token) row.token = body.token;
    // await db.insert('photo', row);
    return { url, rect, data };
};

/**
 * @param {{session:{user:User}}} req
 */
exports.list = async function(req, res) {
    // gparam "../api/file/list.json"
    /**
     * @typedef {object} list_body
     * @property {string} token 身份信息
     * @property {number} [create_min] 多久之后
     * @property {number} [create_max] 多久之前
     * @property {number} [offset] 偏移时间
     */
    /** @type {list_body} */
    let body = req.body;
    let sql = db.select('photo', `name,create_at,data,concat('https://ws1.sinaimg.cn/mw690/',uri) as url`); //.where({token: this.token})
    if (body.create_max) {
        sql.where('create_at', '<=', body.create_max);
    }
    if (body.create_min) {
        sql.where('create_at', '>=', body.create_min);
    }
    return await sql.limit(body.offset, 50);
};

/**
 * @param {{session:{user:User}}} req
 */
exports.code = async function(req, res) {
    // gparam "../api/file/code.json"
    /**
     * @typedef {object} code_body
     * @property {string} [username] 用户名
     * @property {string} code 验证码
     */
    /** @type {code_body} */
    let body = req.body;
    let user = req.session.user;
    let name = body.username || config.sina.username;
    await SinaBed[name](body.code);
    SinaBed[name] = null;
};

/**
 * @param {{session:{user:User}}} req
 */
exports.ip = async function(req, res) {
    // gparam "../api/file/ip.json"
    /**
     * @typedef {object} ip_body
     */
    /** @type {ip_body} */
    let body = req.body;
    let user = req.session.user;
    return { ip: req.ip, ua: req.ua };
};