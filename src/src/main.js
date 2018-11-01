// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import './styles/font/iconfont.css';
// router
import Router from 'vue-router';
Vue.use(Router);
import router from './router';
// muse-ui
import 'muse-ui/dist/muse-ui.css';
import MuseUI from 'muse-ui';
Vue.use(MuseUI);
// Helpers
import Helpers from 'muse-ui/lib/Helpers';
Vue.use(Helpers);
// 进度条
import 'muse-ui-progress/dist/muse-ui-progress.css';
import MuseUIProgress from 'muse-ui-progress';
Vue.use(MuseUIProgress, {
	color: 'red'
});
// toast
import Toast from 'muse-ui-toast';
Vue.use(Toast, {
    position: 'top'
});
// loading
import 'muse-ui-loading/dist/muse-ui-loading.css'; // load css
import Loading from 'muse-ui-loading';
Vue.use(Loading);
// 提示框
import 'muse-ui-message/dist/muse-ui-message.css';
import Message from 'muse-ui-message';
Vue.use(Message);
// custom
import store from './store';
import './styles/base.less';
import './components';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    components: { App },
    template: '<App/>'
});