const axios = require('axios');
const sinaSSOEncoder = require('./sinaSSOEncoder.js');
const querystring = require('querystring');
const axiosCookieJarSupport = require('node-axios-cookiejar');
const tough = require('tough-cookie');
const FileCookieStore = require("tough-cookie-filestore");
const path = require('path');
const fs = require('fs');
const readline = require('readline');

class SinaBed {
    /**
     * 
     * @param {string} name 
     * @param {string} passwd 
     */
    constructor(name, passwd) {
        this.username = name;
        this.password = passwd;
        let filename = path.join(__dirname, name + ".json");
        if (!fs.existsSync(filename)) fs.writeFileSync(filename, '{}');
        this.cookieJar = new tough.CookieJar(new FileCookieStore(filename));
        this.axios = axios.default.create();
        axiosCookieJarSupport(this.axios);
    }
    async preLogin() {
        let encodeUserName = new Buffer(encodeURIComponent(this.username)).toString('base64');
        let preLoginUrl = 'http://login.sina.com.cn/sso/prelogin.php?entry=weibo&checkpin=1&callback=sinaSSOController.preloginCallBack&rsakt=mod&client=ssologin.js(v1.4.18)&su=' + encodeUserName;
        let preLoginResp = await this.axios.get(preLoginUrl);
        let preContentRegex = /\((.*?)\)/g;
        let patten = preContentRegex.exec(preLoginResp.data);
        let { nonce, pubkey, servertime, rsakv, pcid, showpin } = JSON.parse(patten[1]);
        return { nonce, pubkey, servertime, rsakv, pcid, showpin };
    }
    /**
     * [login and save cookie to file]
     * @param  {[String]} username {weibo account username}
     * @param  {[String]} password {weibo account password }
     */
    async login(username, password) {
        let RSAKey = new sinaSSOEncoder.RSAKey();
        let { nonce, pubkey, servertime, rsakv, pcid, showpin } = await this.preLogin();
        RSAKey.setPublic(pubkey, "10001");
        let passwd = RSAKey.encrypt([servertime, nonce].join("\t") + "\n" + password);
        username = new Buffer(encodeURIComponent(username)).toString('base64');
        let data = {
            'entry': 'weibo',
            'gateway': '1',
            'from': '',
            'savestate': '7',
            'useticket': '1',
            'pagerefer': 'http://weibo.com/p/1005052679342531/home?from=page_100505&mod=TAB&pids=plc_main',
            'vsnf': '1',
            'su': username,
            'service': 'miniblog',
            'servertime': servertime,
            'nonce': nonce,
            'pwencode': 'rsa2',
            'rsakv': rsakv,
            'sp': passwd,
            'sr': '1366*768',
            'encoding': 'UTF-8',
            'prelt': '115',
            'url': 'http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack',
            'returntype': 'META'
        };
        if (showpin) {
            await this.axios.get(`http://login.sina.com.cn/cgi/pin.php?r=${Math.floor(Math.random() * 1e8)}&s=0&p=${pcid}`, { responseType: 'stream' }).then(res => {
                res.data.pipe(fs.createWriteStream(`public/${this.username}.png`));
            });
            SinaBed[this.username] = pinCode => {
                data['door'] = pinCode;
                data['pcid'] = pcid;
                return this.acquireCookie(data);
            };
            throw 'pincode';
        }
        await this.acquireCookie(data);
    }
    async acquireCookie(data) {
        let url = 'http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.18)';
        let loginResp = await this.axios.post(url, querystring.stringify(data), {
            jar: this.cookieJar,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0',
            }
        });
        let m = /location.replace\(\'(.*?)\'\)/g.exec(loginResp.data);
        if (!m) throw '登录失败,密码错误';
        await this.axios.get(m[1], { jar: this.cookieJar, withCredentials: true }).catch(e => e);
    }
    inputPinCode() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve, reject) => {
            rl.question('请输入验证码，验证码图片在根目录下\n', (pinCode) => {
                console.log(`你输入的验证码为：${pinCode}`);
                rl.close();
                resolve(pinCode);
            });
        });
    }
    /**
     * @param {String} b64_data picture base64
     * @param {number} [errTime]
     * @return {Promise<String>} pid
     */
    async upload(b64_data, errTime) {
        errTime = errTime || 0;
        try {
            let imageUrl = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog';
            let upImgResp = await this.axios.post(imageUrl, querystring.stringify({ b64_data }), {
                jar: this.cookieJar,
                withCredentials: true,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0',
                }
            });
            let { data } = JSON.parse(upImgResp.data.replace(/([\s\S]*)<\/script>/g, ''));
            if (data.count == -11) {
				errTime = 5;
                throw '格式不支持';
            }
            if (data.count == -1) {
                throw '新浪账号过期';
            }
            if (data.count < 1) {
                throw '上传失败:错误代码' + data.count;
            }
            return data['pics']['pic_1']['pid'];
        } catch (e) {
            errTime += 1;
            console.log('发生错误，重新登录中。。。', e + "");
            if (errTime > 5) { //retry time when upload fail
                errTime = 0;
                throw e;
            }
            return this.login(this.username, this.password).then(() => {
                return this.upload(b64_data, errTime);
            });
        }
    }
}
module.exports = SinaBed;