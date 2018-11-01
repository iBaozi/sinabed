import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import user from './modules/user';
import history from './modules/history';
// import createLogger from './logger.js';
let modules = {};

for (let item of [app, user, history]) {
    modules[item.name] = item;
}

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules,
    strict: debug,
    // plugins: debug ? [createLogger()] : []
});