import router from '../router';
import lib from './lib';

let userAgent = window.navigator.userAgent.toLowerCase();
let utils = {
    env: {
        ua: userAgent,
        wx: /micromessenger/.test(userAgent),
        mb: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent),
    }, // userAgent
    os(ua) {
        ua = ua || userAgent;
        let oss = {
            微信: /micromessenger/i,
            WP: /windows phone/i,
            Mac: /os x/i,
            Android: /Android/i,
            Linux: /linux/i,
            iPhone: /\(iPhone.*os (\d+)[._](\d+)/i,
            iPad: /\(iPad.*os (\d+)[._](\d+)/i,
            iOS: /ios/i,
            ChromeOS: /cros/i,
            Windows10: /windows nt 10\.0/i,
            Windows8: /windows nt 6\.[23]/i,
            Windows7: /windows nt 6\.1/i,
            WindowsVista: /windows nt 6\.0/i,
            Windows2003: /windows nt 5\.2/i,
            WindowsXP: /windows nt 5\.1/i,
            Windows2000: /windows nt 5\.0/i,
            Windows: /windows nt/i,
            Wii: /wii/i,
            PS3: /playstation 3/i,
            PSP: /playstation portable/i,
            Bada: /Bada\/(\d+)\.(\d+)/i,
            Curl: /curl\/(\d+)\.(\d+)\.(\d+)/i
        };
        for (let k in oss) {
            let v = oss[k];
            if (v.test(ua)) return k;
        }
        return '未知';
    },
    replace(data) {
        let query = {};
        for (let k in data) {
            let v = data[k];
            query[k] = encodeURIComponent(typeof v === "string" ? v : JSON.stringify(v));
        }
        router.replace({ query });
    },
    /**
     * 单向绑定query参数
     * @template T
     * @param {T} params 
     * @param {boolean} [auto] 是否自动更新query
     * @returns {T}
     */
    query(params, auto) {
        let data = {};
        let timeout;
        let query = Object.assign({}, router.currentRoute.query);
        for (let k in params) {
            let value = params[k];
            Object.defineProperty(data, k, {
                configurable: true,
                enumerable: true,
                get() {
                    let tmp = query[k];
                    try {
                        tmp = decodeURIComponent(tmp);
                        tmp = JSON.parse(tmp);
                    } catch (err) {}
                    return tmp;
                },
                set(v) {
                    let tmp = encodeURIComponent(typeof v === "string" ? v : JSON.stringify(v));
                    if (query[k] != tmp) {
                        query[k] = tmp;
                        if (auto) {
                            if (timeout) clearTimeout(timeout);
                            timeout = setTimeout(function() {
                                router.replace({ query });
                            });
                        }
                    }
                }
            });
            let tmp = query[k];
            if (tmp == null) {
                query[k] = encodeURIComponent(typeof value === "string" ? value : JSON.stringify(value));
            } else {
                query[k] = tmp;
            }
        }
        return data;
    },
    /**
     * node 是否是 parent 的后代
     * @param {HTMLElement} node 
     * @param {HTMLElement} parent 
     */
    hasParent(node, parent) {
        while (node) {
            if (node.parentElement == parent) return true;
            node = node.parentElement;
        }
        return false;
    },
    /**
     * 获取文件
     * @param {string} accept 'image/png'
     * @param {boolean} multiple 
     * @returns {Promise<File|FileList>}
     */
    pick(accept, multiple) {
        return new Promise((resolve, reject) => {
            let input = document.createElement('input');
            input.type = 'file';
            input.multiple = multiple;
            input.accept = accept || '*';
            input.onchange = function(e) {
                resolve(multiple ? e.target.files : e.target.files[0]);
            };
            input.click();
        });
    },
    /**
     * 清除空数据，用于发起请求
     * @param {any} value 
     */
    clearNull(value) {
        if (value instanceof Date)
            return value.getTime();
        if (typeof value === "object" && !(value instanceof Array)) {
            let data = {};
            for (let k in value) {
                if (value[k] != null) {
                    data[k] = utils.clearNull(value[k]);
                }
            }
            return data;
        }
        return value;
    },
    /**
     * 复制一个去掉keys的body对象
     * @param {Object} body 
     * @param {string[]|{}} keys 
     */
    clearKeys(body, keys) {
        let data = {};
        if (keys instanceof Array) { // 清除keys中的字段
            Object.assign(data, body);
            for (let key of keys) {
                delete data[key];
            }
        } else { // 清除与keys值相同的字段
            for (let k in body) {
                let v = body[k];
                if (keys[k] != v)
                    data[k] = v;
            }
        }
        return data;
    },
    /**
     * 深度优先遍历
     * @param {any} data 
     * @param {{(node:any,ctx:{key:string,parent:this})=>boolean}} fn 
     * @param {string} key 
     * @param {{key:string,parent:this,node:any}} ctx 
     */
    dfs(data, fn, key, ctx) {
        if (!data) return;
        ctx = ctx || {};
        if (data instanceof Array) {
            for (var i = 0; i < data.length; i++)
                utils.dfs(data[i], fn, key, { key: i, parent: ctx.parent });
            return;
        }
        ctx.node = data;
        if (fn(data, ctx)) return;
        if (key) utils.dfs(data[key], fn, key, { key: key, parent: ctx });
        else if (typeof data === "object")
            for (var k in data)
                utils.dfs(data[k], fn, key, { key: k, parent: ctx });
    },
    /**
     * 是否邮箱
     * @param {string} val 
     */
    isEmail(val) {
        return /^[\w-]+@[\w-]+(.[\w-]+)+$/.test(val);
    },
    /**
     * 是否手机
     * @param {string} val 
     */
    isTel(val) {
        return /^1\d{10}$/.test(val);
    },
    isUrl(val) {
        return /^https?:\/\/[^\.]+\.[^\.]+/.test(val);
    },
    /**
     * 验证规则
     */
    RULES: {
        need: { validate: val => val, message: '必须填写' },
        tel: { validate: val => !val || utils.isTel(val), message: '手机格式不正确' },
        email: { validate: val => !val || utils.isEmail(val), message: '邮箱格式不正确' },
        passwd: { validate: val => val.length >= 6 && val.length <= 32, message: '密码长度大于6小于32' },
        url: { validate: val => !val || utils.isUrl(val), message: '网址格式不正确' },
    },
    /**
     * 构建验证规则
     * @param  {...string} args 
     * @return {{validate:(val:any)=>boolean,message:string}[]}
     */
    rule() {
        let s = [];
        for (let i = 0; i < arguments.length; i++) {
            let r = utils.RULES[arguments[i]];
            if (r instanceof Array) s.push.apply(s, r);
            else if (r) s.push(r);
        }
        return s;
    },
    loading(name = 'loading') {
        return function(target, key, descriptor) {
            const method = descriptor.value;
            descriptor.value = function() {
                if (this[name]) return;
                this[name] = true;
                let ret = method.apply(this, arguments);
                if (ret && typeof ret.then === "function") {
                    return ret.then(data => {
                        this[name] = false;
                        return data;
                    }, err => {
                        this[name] = false;
                        return Promise.reject(err);
                    });
                } else {
                    this[name] = false;
                }
                return ret;
            };
            return descriptor;
        };
    },
    leftJoin(list, data, key) {
        let map = {};
        for (let item of data) {
            map[item.id] = item;
        }
        for (let item of list) {
            let id = item[key + '_id'];
            item[key] = map[id] || { id };
        }
    },
    selectNode(el) {
        let selection = window.getSelection();
        selection.empty();
        let range = document.createRange();
        range.selectNode(el);
        selection.addRange(range);
    },
    copy(str) {
        try {
            var input = document.createElement('input');
            input.style.position = 'fixed';
            input.style.top = '-100px';
            input.value = str;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        } catch (error) {
            return false;
        }
        return true;
    }
};

export default Object.assign(utils, lib);