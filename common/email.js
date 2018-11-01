'use strict';
/**
 * Created Date: 2017-09-30 10:07:50
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const nodemailer = require('nodemailer');
const logger = require("./log").getLogger("dev");
const config = require("./config");

const transporter = nodemailer.createTransport({
    pool: true,
    service: "qq",
    auth: {
        user: 'admin@inu1255.cn',
        pass: 'gqsmctiolxukbjag'
    }
});

transporter.verify(function(error, success) {
    if (error) {
        logger.warn('邮箱发送系统初始化失败', error);
    } else {
        logger.info('邮箱发送系统初始化成功');
    }
});

exports.sendCode = function(to, code) {
    const message = {
        from: `${config.title}<admin@inu1255.cn>`,
        to,
        subject: config.title + '验证码',
        html: `<p>您的验证码是[${code}]</p><p>your verification code is [${code}]</p>`
    };
    return new Promise(function(resolve, reject) {
        transporter.sendMail(message, function(error, info) {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};

exports.sendHtml = function(to, title, html) {
    const message = {
        from: `${config.title}<admin@inu1255.cn>`,
        to,
        subject: title,
        html
    };
    return new Promise(function(resolve, reject) {
        transporter.sendMail(message, function(error, info) {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};