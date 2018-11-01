import VueRouter from 'vue-router';
import routes from './routes';
import { Component } from "vue-property-decorator";
import store from '../store/index';
Component.registerHooks([
    'beforeRouteEnter',
    'beforeRouteLeave',
    'beforeRouteUpdate'
]);
let router = new VueRouter({
    mode: 'history',
    routes
});
let title = document.title;

router.afterEach((to, from) => {
    if (to.meta.solo) {
        if (!store.state.app.solo) store.commit('app.solo', true);
    } else {
        if (store.state.app.solo) store.commit('app.solo', false);
	}
    document.title = to.meta.title || title;
    if (to.meta.login) {
        store.commit('app.l', 1);
    } else {
        store.commit('app.l', 0);
    }
});

export default router;