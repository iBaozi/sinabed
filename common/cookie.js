const db = require("./db");
const utils = require("./utils");

function getLoc(url) {
    var m = /^([^:]+):\/\/([^?#/]+)/.exec(url);
    if (!m) return null;
    return {
        protocal: m[1],
        host: m[2],
    };
}

exports.domains = function domains(url) {
    let host = getLoc(url).host;
    if (/^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(host)) {
        return [host];
    }
    let domains = host.split(".").reverse().reduce(function(li, item) {
        if (li instanceof Array) {
            li.push("." + item + li[li.length - 1]);
            return li;
        }
        if (li) {
            return ["." + item + "." + li];
        }
    });
    if (typeof domains === "string") {
        return [domains];
    }
    domains[domains.length - 1] = domains[domains.length - 1].slice(1);
    return domains;
};

exports.get = async function(url) {
    let domains = exports.domains(url);
    let rows = await db.execSQL(`select name,value from cookie where domain in (?)`, [domains]);
    return rows.reduce(function(li, row) {
        li.push(row.name + "=" + row.value);
        return li;
    }, []).join("; ");
};

/**
 * 
 * @param {String} url 
 * @param {String|Object|Array} cookie 
 * @returns {Promise}
 */
exports.set = function(url, cookie) {
    if (typeof cookie === "string") {
        return exports.set(url, utils.parseResCookie(cookie));
    }
    if (cookie instanceof Array) {
        return Promise.all(cookie.map(c => exports.set(url, c, getLoc(url).host)));
    }
    if (typeof cookie === "object") {
        return db.insertOrUpdate("cookie", cookie).where({
            domain: cookie.domain,
            name: cookie.name
        });
    }
};

exports.save = async function(page, url) {
    for (let domain of exports.domains(url)) {
        domain = domain.charAt(0) == "." ? domain.slice(1) : domain;
        let url = "http://" + domain.trim(".");
        let cookies = await page.cookies(url);
        await exports.set(url, cookies);
    }
};

exports.load = async function(page) {
    let rows = await db.execSQL(`select * from cookie`);
    await page.setCookie.apply(page, rows.map(row => ({
        name: row.name,
        value: row.value,
        url: row.url,
        domain: row.domain,
        path: row.path,
        expires: typeof row.expires === "number" ? row.expires : (new Date(row.expires).getTime() / 1000),
        httpOnly: Boolean(row.httpOnly),
        secure: Boolean(row.secure),
        sameSite: row.sameSite || "",
    })));
};