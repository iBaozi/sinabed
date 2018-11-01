// const getui = require("../lib/getui/");
// module.exports = getui;
const xiaomi = require('xiaomi-push');
const config = require('./config');

var Message = xiaomi.Message;
var Notification = xiaomi.Notification;

var notification = new Notification(config.xiaomi);

class Msg {
    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.payload = data.payload;
        this.badge = this.badge;
    }
    toMsg() {
        var msg = new Message();
        msg
            .restrictedPackageName("io.dcloud.H54C8AEE0")
            .title(this.title)
            .description(this.description)
            .payload(typeof this.payload === "string" ? this.payload : JSON.stringify(this.payload))
            .passThrough(0)
            .notifyType(-1)
            .extra('badge', this.badge || 1);
        return msg;
    }
}

/**
 * 
 * @param {Array<String>} list 
 * @param {Msg} msg 
 */
exports.send = function(regid, msg) {
    return new Promise((resolve, reject) => {
        notification.send(regid, new Msg(msg).toMsg(), function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};