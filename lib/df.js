const Define = require('../common/db/define');
const argv = require('yargs').argv;
const db = require('../common/db');

let df = new Define();
// 用户表
df.table('photo', [
    df.unsigned('id').notNull().auto_increment(),
    df.varchar('ip', 64).comment('上传图片的IP'),
    df.varchar('ua', 256).default('').comment('客户端信息'),
	df.varchar('token', 37).comment('查询凭证'),
	df.varchar('name', 64).default('').comment('文件名'),
    df.varchar('uri', 32).comment('新浪图片uri'),
	df.bigint('create_at').notNull().comment('图片上传时间'),
	df.varchar('data', 512).default('').comment('二维码信息'),
    df.primary('id'),
    df.index('token')
]);

exports.df = df;
exports.merge = async function() {
    if (argv.table) return await df.tables[argv.table].merge(db, true);
    return await df.merge(db, true);
};
exports.table = async function() {
    let tables = [];
    if (argv.table) {
        tables.push({ name: argv.table, sqls: await df.tables[argv.table].merge(db) });
    } else {
        tables = await df.merge(db);
    }
    for (let item of tables) {
        console.log('表格:', item.name);
        for (let sql of item.sqls) {
            console.log(sql);
        }
    }
};
exports.params = async function() {
    if (argv.table) {
        let params = df.tables[argv.table].params();
        console.log(JSON.stringify(params, null, 4));
    } else {
        console.log('需要指定table');
    }
};
exports.ts = async function() {
    if (argv.table) {
        let str = df.tables[argv.table].typescript();
        console.log(str);
    } else {
        console.log('需要指定table');
    }
};

async function main() {
    if (exports[argv._[0]]) {
        await exports[argv._[0]]();
    } else {
        console.log('未知指令:', argv._[0]);
    }
}

if (require.main == module) {
    main(process.argv[2]).then(function() {
        process.exit();
    }).catch(function(err) {
        console.log(err);
        console.log("err end");
        process.exit(1);
    });
}