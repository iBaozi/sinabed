const type = "wap"; // "app","pc"
let dev, host, api, app;
switch (type) {
    case "app":
        app = true;
        dev = /^https?:\/\//.test(location.href);
        host = "http://automan.inu1255.cn";
        api = host;
        if (dev) {
            host = (/https?:\/\/[^/:]+/.exec(window.location.href))[0];
            api = host + ":3000";
        }
        document.write(`<script src="${(dev ? "static/" : "") + "cordova.js"}"></script>`);
        break;
    case "wap":
    case "pc":
        dev = location.href.indexOf(":8080") >= 0;
		host = (/https?:\/\/[^/:]+/.exec(window.location.href))[0];
        if (dev) api = host + ":3000";
		else api = location.protocol + "//" + location.host;
		// api = 'http://sinabed.inu1255.cn';
        break;
}
export default {
    app, // 是否是cordova程序
    dev, // 是否是开发环境
    host, // 当前域名
    api, // 接口地址
    io: {
        reconnection: false
    }
};