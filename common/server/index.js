const db = require("../db");
const app = require("./app");
const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// const ws = require("./ws");
// const log = require("../log").getLogger("ws");

// let count = 0;
// io.on('connection', function(socket) {
//     count++;
//     socket.on("disconnect", function() {
//         ws.del(socket);
//         count--;
//     });

//     socket.on("login", function(data) {
//         if (!data) return;
//         let { title, password } = data;
//         console.log("ws login", title, password);
//         db.select("user", ["id"]).where({ password }).where(db.where({ account: title }).or({ telphone: title }).or({ email: title }).build()).first().then(function(user) {
//             if (user) ws.add(user.id, socket);
//             socket.emit("logined", user);
//         }, x => socket.emit("logined", null));
//     });

//     socket.on("logout", function() {
//         ws.del(socket);
//     });
// });

// setInterval(function() {
//     log.info("当前在线", count);
// }, 60e3);

module.exports = server;