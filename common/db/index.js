const MysqlEngine = require("./mysql");
const config = require("../config");

module.exports = new MysqlEngine(config.mysql);