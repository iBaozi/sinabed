const noginx = require("express-noginx");
const pool = require("./storage")("proxy-pool");
const db = require("./db");

if (!pool.port) {
    pool.cache = {};
    pool.port = 13578;
}

exports.proxy = async function(uid, domain, check) {
    let row = await db.select("uport", ["port"]).where({ uid, domain }).first();
    if (row && pool.cache[row.port]) {
        pool.cache[row.port][domain] = { check, time: new Date().getTime() };
        console.log("switch proxy domain", row.port, domain);
        return row.port;
    }
    for (let k in pool.cache) {
        let item = pool.cache[k];
        let v = item.domains[domain];
        if (v && v.time + 300e3 > new Date().getTime()) continue;
        item.domains[domain] = { check, time: new Date().getTime() };
        console.log("update proxy domain", item.port, domain);
        await db.insertOrUpdate("uport", { uid, domain, port }).where({ domain, port });
        return item.port;
    }
    let item = noginx.express();
    let port = pool.port++;
    pool.cache[port] = item;
    item.domains = {};
    item.domains[domain] = { check, time: new Date().getTime() };
    console.log("new proxy", port, domain);
    await db.insertOrUpdate("uport", { uid, domain, port }).where({ domain, port });
    item.use(function(req, res, next) {
        if (req.url.indexOf(":") <= 0) {
            req.url = req.protocol + "://" + req.headers["host"] + req.url;
        }
        let domain = req.hostname;
        let app = item.domains[domain];
        if (app && app.check) {
            app.time = new Date().getTime();
            app.check(req, res).then(ok => {
                if (ok) delete item.domains[domain];
                next();
            }, next);
        } else next();
    });
    item.port = port;
    item.listen(port);
    item.server.on("error", function(err) {
        console.log(err);
    });
    return port;
};