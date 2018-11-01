'use strict';
/**
 * Created Date: 2017-09-28 21:10:50
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const log4js = require("log4js");

log4js.configure({
    appenders: {
        app: {
            type: 'dateFile',
            daysToKeep: 7,
            keepFileExt: true,
            filename: `./log/app.log`
        },
        console: { type: 'stdout' },
        access: {
            type: 'dateFile',
            daysToKeep: 7,
            keepFileExt: true,
            filename: `./log/access.log`
        },
        db: {
            type: 'dateFile',
            daysToKeep: 7,
            keepFileExt: true,
            filename: `./log/db.log`
        },
        dev: {
            type: 'dateFile',
            daysToKeep: 7,
            keepFileExt: true,
            filename: `./log/dev.log`
        }
    },
    categories: {
        default: {
            appenders: ["app", "console"],
            level: 'debug'
        },
        db: {
            appenders: ["db", "console"],
            level: 'debug'
        },
        access: {
            appenders: ["access", "console"],
            level: 'info'
        },
        dev: {
            appenders: ["dev", "console"],
            level: 'debug'
        }
    }
});

exports.getLogger = function(name) {
    return log4js.getLogger(name);
};
exports.connectLogger = log4js.connectLogger(log4js.getLogger('access'), { level: log4js.levels.INFO, format: '[:response-timems :method :url\t\t :remote-addr]' });