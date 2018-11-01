import Vue from 'vue';
import utils from '../common/utils';
import request from '../common/request';
import './lib';

Vue.prototype.$get = function(url, data, config) {
    if (!data) return request.get(url, config);
    data = utils.clearNull(data);
    let ss = [];
    for (let k in data) {
        let v = data[k];
        if (typeof v === "undefined") continue;
        if (typeof v === "object") v = JSON.stringify(v);
        ss.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
    ss = ss.join('&');
    return request.get(url + (url.indexOf('?') < 0 ? '?' : '&') + ss, config);
};
Vue.prototype.$post = request.post;