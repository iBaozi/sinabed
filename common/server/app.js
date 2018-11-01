/**
 * Created Date: 2017-09-25 17:30:38
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const express = require("express");
const bodyParser = require('body-parser');
const hot = require("node-hot-require");
hot.filter = function(filename) {
    if (filename.endsWith("common/storage.js")) {
        return false;
    }
    return true;
};
const router = hot.require("../../routes/index.js");
const session = require("../session");
const connectLogger = require("../log").connectLogger;
const app = express();
const config = require('../config');
const lib = hot.require('../../lib/index.js');
const utils = require("../utils");
const path = require('path');

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(connectLogger);
app.use("/api", utils.formdata(config.upload));
app.use("/api", session);
app.use("/api", lib.expressSessionUpdate);
// if (config.dev) {
//     app.use("/api", function(req, res, next) {
//         if (!req.session.user)
// 			req.session.user = { id: 1 };
// 		next();
//     });
// }
app.use("/api", utils.cross);
app.use("/api", function(req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }
    req.realip = ip;
    req.ua = req.headers['user-agent'] || '';
    if (req.ua.length > 256) req.ua = req.ua.slice(0, 256);
    next();
});
app.use("/api", router);

app.get("/upgrade", function(req, res) {
    hot.reloadAll();
    res.send(router.version());
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = app;