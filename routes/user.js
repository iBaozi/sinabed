/**
 * Created Date: 2017-09-29 15:01:20
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const db = require("../common/db");
const email = require("../common/email");
const config = require("../common/config");
const logger = require("../common/log").getLogger();
const utils = require('../common/utils');
const cofs = require('../common/cofs');
const lib = require('../lib');

/**
 * @param {{session:{user:User}}} req
 */
exports.list = async function(req, res) {
    // gparam "../api/user/list.json"
    /**
     * @typedef {object} list_body
     */
    /** @type {list_body} */
    let body = req.body;
    let user = req.session.user;
    if (!user.teams.length) return [];
    let uIDs = [],
        tIDs = [];
    let ctMap = {},
        ttMap = {};
    let teams = [];
    for (let team of user.teams) {
        uIDs.push(team.create_id);
        tIDs.push(team.id);
        team = Object.assign({ users: [] }, team);
        ctMap[team.create_id] = team;
        ttMap[team.id] = team;
        teams.push(team);
    }
    var rows = await db.execSQL(`select id,name,avatar from user where id in (?)`, [uIDs]);
    for (let user of rows) {
        ctMap[user.id].users.push(user);
    }
    var rows = await db.execSQL(`select id,name,avatar,team_id,job,pow,state from user inner join team_user on team_id in (?) and user.id=team_user.user_id`, [tIDs]);
    for (let user of rows) {
        ttMap[user.team_id].users.push(user);
        delete user.team_id;
    }
    return teams;
};

exports.login = async function(req, res) {
    const body = req.body;
    const user = await db.select("user")
        .where("account", body.title)
        .orWhere("email", body.title)
        .orWhere("tel", body.title)
        .first();
    if (!user) {
        return 404; // 用户不存在
    }
    if (user.passwd != body.passwd) {
        return 405; // 密码错误
    }
    return await lib.getUserInfo(req, user);
};

exports.logout = function(req, res) {
    delete req.session.user;
};

exports.register = async function(req, res) {
    // gparam "../api/user/register.json"
    /**
     * @typedef {Object} register_body
     * @property {String} account 账号
     * @property {String} title 邮箱/手机
     * @property {String} passwd 密码
     * @property {String} code 验证码
     * @property {String} [invite] 邀请码
     */
    /** @type {register_body} */
    const body = req.body;
    let n = [];
    if (body.title) n.push(body.title);
    if (body.account) n.push(body.account);
    var user = await db.select("user").where("account in (?) or email in (?) or tel in (?)", [n, n, n]).first();
    if (user) return 405;
    const errNo = await lib.checkCode(body.title, body.code);
    if (errNo) {
        return errNo;
    }
    var data = {
        account: body.account,
        passwd: body.passwd,
        name: body.name || ('某用户' + utils.randomNumber(4)),
        create_at: +new Date,
    };
    if (/^1\d{10}$/.test(body.title)) {
        // 手机注册
        data.tel = body.title;
    } else {
        // 邮箱注册
        data.email = body.title;
        data.avatar = `https://cn.gravatar.com/avatar/${utils.md5(body.title)}?s=64&d=identicon&r=PG`;
    }
    let title = body.title;
    if (body.invite) {
        body.invite = utils.Decrypt(body.invite);
        let invitor = await db.select("user", "money").where("id", body.invite).first();
        if (!invitor) {
            return 409;
        }
        invitor.money += 100;
        data.money = 200;
        let pack = await db.execSQL([
            db.update("verify", { rest: -1 }).where("title", title),
            db.update("user", invitor).where("id", body.invite),
            db.insert("user", data)
        ]);
        data.id = pack[2].insertId;
    } else {
        data.money = 100;
        let pack = await db.execSQL([
            db.update("verify", { rest: -1 }).where("title", title),
            db.insert("user", data)
        ]);
        data.id = pack[1].insertId;
    }
    lib.afterRegist(data);
    return lib.getUserInfo(req, data);
};

exports.codeSend = async function(req, res) {
    // gparam "../api/user/code_send.json"
    /**
     * @typedef {Object} code_send_body
     * @property {String} [title] 手机/邮箱
     * @property {String} [code] 图片验证码
     */
    /** @type {code_send_body} */
    const body = req.body;
    const code = utils.randomNumber(6);
    let title = body.title;
    var user = await db.select("user").where("account=? or email=? or tel=?", [title, title, title]).first();
    if (user) return 407;
    if (body.email) {
        if (config.dev) {
            logger.info("发送邮箱验证码", code);
        } else {
            await email.sendCode(title, code);
        }
    } else {
        // TODO: 发送手机验证码
        return 402;
    }
    const one = await db.select("verify").where("title", title).first();
    if (one) {
        await db.update("verify", { code, rest: 10, update_at: +new Date }).where("title", title);
    } else {
        await db.insert("verify", { title, code, update_at: +new Date });
    }
};

exports.codeCheck = async function(req, res) {
    const body = req.body;
    return await lib.checkCode(body.title, body.code);
};

exports.whoami = function(req, res) {
    if (req.body.force) {
        return lib.getUserInfo(req);
    }
    return lib.getUserInfo(req, req.session.user);
};

/**
 * @param {{session:{user:User}}} req
 */
exports.add = async function(req, res) {
    // gparam "../api/user/add.json"
    /**
     * @typedef {object} add_body
     * @property {string} [name] 姓名
     * @property {string} [account] 账号
     * @property {string} [email] 邮箱
     * @property {string} [tel] 电话号码
     * @property {string} [passwd] 密码
     * @property {string} [avatar] 头像url
     * @property {string} [profile] 个人介绍
     * @property {string} [role] 角色
     */
    /** @type {add_body} */
    let body = req.body;
    let n = [];
    if (body.account) n.push(body.account);
    if (body.email) n.push(body.email);
    if (body.tel) n.push(body.tel);
    var user = await db.select("user").where("account in (?) or email in (?) or tel in (?)", [n, n, n]).first();
    if (user) return 405;
    if (!body.avatar && body.email)
        body.avatar = `https://cn.gravatar.com/avatar/${utils.md5(body.email)}?s=64&d=identicon&r=PG`;
    body.create_at = +new Date;
    body.id = await db.insert('user', body).id();
    lib.afterRegist(body);
    return body;
};

exports.edit = async function(req, res) {
    // gparam "../api/user/edit.json"
    /**
     * @typedef {object} edit_body
     * @property {number} [id] 用户ID
     * @property {string} [name] 姓名
     * @property {string} [account] 账号
     * @property {string} [email] 邮箱
     * @property {string} [ecode] 邮箱验证码
     * @property {string} [tel] 电话号码
     * @property {string} [tcode] 手机验证码
     * @property {string} [passwd] 密码
     * @property {string} [passwd0] 旧密码
     * @property {string} [avatar] 头像url
     * @property {string} [profile] 个人介绍
     * @property {string} [role] 角色
     * @property {number} [money] 金币
     */
    /** @type {edit_body} */
    let body = req.body;
    let user = req.session.user;
    let aim;
    if (user.id != body.id) aim = req.session.user;
    else aim = await db.select('user').where({ id: body.id }).first();
    let data = utils.clearKeys(body, ["passwd0", "ecode", "tcode"]);
    data = utils.clearKeys(data, aim);
    let n = [];
    if (body.account) n.push(body.account);
    if (body.email) n.push(body.email);
    if (body.tel) n.push(body.tel);
    if (n.length) { // 查重
        aim = await db.select("user").where("account in (?) or email in (?) or tel in (?)", [n, n, n]).first();
        if (aim) return 405;
    }
    if (Object.keys(data).length <= 0) return;
    if (data.passwd) {
        if (user.role != 'admin') {
            if (body.passwd0) { // 用旧密码改
                if (body.passwd0 != aim.passwd) return 405;
            } else if (body.ecode) { // 通过邮箱改
                let errNo = await lib.checkCode(aim.email, body.ecode);
                if (errNo) return errNo;
            } else if (body.tcode) { // 通过手机改
                let errNo = await lib.checkCode(aim.tel, body.tcode);
                if (errNo) return errNo;
            } else {
                return 405;
            }
        }
    }
    if (data.email) {
        if (user.role != 'admin') {
            let errNo = await lib.checkCode(data.email, body.ecode);
            if (errNo) return errNo;
        }

        if (!data.avatar)
            data.avatar = `https://cn.gravatar.com/avatar/${utils.md5(data.email)}?s=64&d=identicon&r=PG`;
    }
    if (data.tel) {
        if (user.role != 'admin') {
            let errNo = await lib.checkCode(data.tel, body.tcode);
            if (errNo) return errNo;
        }
    }
    await db.update("user", data).where("id", body.id);
    if (user.id == body.id) // 修改自己信息
        Object.assign(user, data);
};

db.select('user').where('role', 'admin').then(rows => {
    if (!rows.length) {
        console.log(`添加初始用户`);
        return db.insert('user', { account: 'inu1255', passwd: '199337', role: 'admin', create_at: +new Date });
    }
});