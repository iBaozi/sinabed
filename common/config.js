const fs = require('fs');
const argv = require('yargs').argv;
const appname = "sinabed";

const config = {
    appname,
    title: "sl图床",
    apiDir: "api",
    port: 3000,
    mysql: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '123456',
        database: appname,
        connectionLimit: 50,
        supportBigNumbers: true,
        bigNumberStrings: false,
        charset: 'utf8mb4'
    },
    sina: {
        username: '',
        password: '',
    },
    dev: false,
    error: {
        "400": "非法的参数值、格式或类型",
        "401": "您尚未登录",
        "402": "功能尚未实现",
        "403": "没有权限"
    },
    upload: 'public/tmp', // 文件上传目录
    secret: 'j3isue', // 加密字串
    code_expire: 600e3, // 验证码过期时间，10分钟
    xiaomi: { // 小米推送设置
        production: true,
        appSecret: ""
    },

};
config.save = function() {
    fs.writeFile(argv.conf, JSON.stringify(config, null, 2), err => err ? console.error(err) : '');
};

argv.conf = argv.conf || '.config.json';
try {
    const text = fs.readFileSync(argv.conf);
    Object.assign(config, JSON.parse(text));
} catch (error) {
    console.log("使用默认配置");
    config.save();
}

if (argv.port != null) config.port = argv.port;
if (argv.dev != null) config.dev = argv.dev;


module.exports = config;