import config from './config';
import store from '../store';
import utils from './utils';
import axios from 'axios';
import Toast from 'muse-ui-toast';

var request = axios.create({
    withCredentials: true,
});
request.defaults.headers.post['Content-Type'] = 'application/json';
request.interceptors.request.use(function(conf) {
    if (!/^https?:\/\//.test(conf.url))
        conf.url = (conf.url.startsWith('/') ? config.api : config.api + "/api/") + conf.url;
    // loading 动画
    if (conf.loading) {
        // console.log(store.state.app.loading + 1);
        store.commit("app.loading", store.state.app.loading + 1);
    }
    // 进度条
    store.commit("app.r", store.state.app.r + 1);
    if (conf.data instanceof FormData) {
        if (!conf.onUploadProgress) {
            let v;
            conf.data.forEach(x => {
                if (x instanceof File) v = x;
            });
            if (v) {
                store.commit("app.p", { percent: 0, name: v.name });
                conf.onUploadProgress = function(e) {
                    var complete = (e.loaded / e.total * 100 | 0);
                    store.commit("app.p", { percent: complete, name: v.name });
                };
            }
        }
    } else {
        conf.data = utils.clearNull(conf.data);
    }
    return conf;
}, function(error) {
    return Promise.reject(error);
});
// request.interceptors.response.use(function(res) {
//     return new Promise((resolve, reject) => {
//         setTimeout(x => resolve(res), 1200);
//     });
// });
request.interceptors.response.use(function(res) {
    let data = res.data;
    // 关闭 loading
    // console.log(res.config.loading, store.state.app.loading - 1);
    if (res.config.loading && store.state.app.loading > 0) store.commit("app.loading", store.state.app.loading - 1);
    // 关闭 进度条
    if (store.state.app.r > 0) store.commit("app.r", store.state.app.r - 1);
    if (store.state.app.p) store.commit("app.p", 0);
    if (!data) return Promise.reject(404);
    else if (typeof data.no === "undefined") return data;
    else if (data.no === 200) return data.data;
    else if (data.no === 401) {
        if (res.config.url.indexOf("logout") < 0) {
            store.dispatch("logout");
        }
        return Promise.reject(data.msg);
    } else {
        let msg = typeof data.msg === "string" ? data.msg : JSON.stringify(data.msg);
        Toast.error(msg);
        return Promise.reject(data.msg);
    }
}, function(error) {
    // 关闭 loading
    // console.log(error.config.loading, store.state.app.loading - 1);
    if (error.config.loading && store.state.app.loading > 0) store.commit("app.loading", store.state.app.loading - 1);
    // 关闭 进度条
    if (store.state.app.r > 0) store.commit("app.r", store.state.app.r - 1);
    if (store.state.app.p) store.commit("app.p", 0);
    Toast.error(`网络错误`);
    return Promise.reject(error);
});

export default request;