const db = require("../common/db");
const cofs = require('../common/cofs');
const config = require("../common/config");
const utils = require('../common/utils');
const storage = require('../common/storage')('sess_update');

const USERINFO = ["id", "email", "account", "avatar", "name", "sex", "birth_at", "money", "used_money", "invite_code", "profile", "teams"];

/**
 * 更新用户session
 * @param {{session:{user:User}}} req
 * @param {User} user 
 */
exports.expressSessionUpdate = function(req, res, next) {
    let user = req.session.user;
    if (!user) return next();
    let t = storage[user.id];
    if (!t) { // 如果系统重启，每个未登录的用户都需要更新
        t = storage[user.id] = +new Date;
    }
    if (t <= user.t) { // 如果已经更新
        next();
        return;
    }
    exports.getUserInfo(req).then(e => {
        next();
    }, err => {
        console.error(err);
        next();
    });
};

exports.sessUpdate = function(user_id) {
    storage[user_id] = +new Date;
};

exports.updateTeamCnt = function(team_id) {
    return db.execSQL(`update team set cnt=1+(select count(*) from team_user where team_id=? and state=3) where id=?`, [team_id, team_id]);
};

/**
 * 过滤用户信息
 * @param {{session:{user:User}}} req
 * @param {User} user 
 */
exports.getUserInfo = async function(req, user) {
    let data = {};
    if (!user) {
        user = await db.select("user").where("id", req.session.user.id).first();
    }
    if (!user.teams) {
        user.teams = await db.execSQL(`select id,name,create_id,null as state from team where create_id=? union select team.id,name,create_id,state from team left join team_user on team.id=team_user.team_id and state>0 where user_id=?`, [user.id, user.id]);
    }
    user.t = new Date().getTime();
    req.session.user = user;
    if (!user.invite_code) user.invite_code = utils.Encrypt(user.id);
    USERINFO.forEach(function(k) {
        data[k] = user[k];
    });
    return data;
};

/**
 * 检查验证码
 * @param {string} title 邮箱/手机
 * @param {string} code 验证码
 * @return {number} 406, 407
 */
exports.checkCode = async function(title, code) {
    const one = await db.select("verify").where("title", title).first();
    if (!one) {
        return 407;
    }
    // 尝试次数过多
    if (one.rest < 1) {
        return 407;
    }
    // 10分钟内有效
    if (one.update_at < new Date().getTime() - config.code_expire) {
        return 407;
    }
    // 验证码错误
    if (one.code != code) {
        await db.update("verify", { rest: one.rest - 1 }).where("title", title);
        return 406;
    }
};

/**
 * 用户注册后，后续工作
 * @param {User} user 
 */
exports.afterRegist = async function(user) {};