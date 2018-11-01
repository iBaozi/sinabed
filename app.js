/**
 * Created Date: 2017-09-25 17:30:38
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const config = require("./common/config.js");
const hot = require("node-hot-require");
const dev = require("./common/log").getLogger("dev");
const chokidar = require("chokidar");
const server = require("./common/server");
const tasks = hot.require('./lib/tasks.js');

for (let k in tasks) {
    let fn = async () => {
		// console.log(`执行: ${k}`);
        let n = await tasks[k]();
        if (n >= 0) setTimeout(fn, n);
    };
    fn();
}

if (config.dev) {
    hot.watchAll();
    chokidar.watch("./api").on("change", function() {
        hot.reloadAll();
    });
}

hot.on("reload", function(err) {
    if (err) {
        dev.warn("重新加载模块失败", err);
    }
});

server.listen(config.port, function() {
    console.log('Listening on http://localhost:' + config.port);
});