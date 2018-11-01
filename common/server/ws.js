const store = require("../storage")("socket.io");
const Socket = require('socket.io/lib/socket.js');

/**
 * @param {Number} id 
 * @param {Socket} socket 
 */
exports.add = function(id, socket) {
    if (socket) store[id] = socket;
};

/**
 * @param {Socket} socket 
 */
exports.del = function(socket) {
    for (let k in store) {
        if (socket == store[k]) {
            delete store[k];
            break;
        }
    }
};

/**
 * @param {Number} id 
 * @return {Socket} 
 */
exports.get = function(id) {
    return store[id];
};

/**
 * @param {Number} id 
 * @param {(socket:Socket)=>} cb
 */
exports.with = function(id, cb) {
    let socket = store[id];
    if (socket) cb(socket);
    return socket;
};