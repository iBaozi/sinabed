import { Storage } from "./storage";
import Loading from 'muse-ui-loading';
import MuseUIProgress from 'muse-ui-progress';

var loading;
const store = new Storage("app", {
    show: false,
    loading: 0,
    solo: true,
    r: 0, // 加载中的请求
	p: 0, // 显示上传进度 
	l: 0, // 是否需要登录
});

store.addMutations({
    r(state, data) {
        state.r = data;
        if (data) {
            MuseUIProgress.start();
        } else {
            MuseUIProgress.done();
        }
    },
    loading(state, data) {
        state.loading = data;
        if (data) {
            loading = Loading();
        } else {
            if (loading) loading.close();
        }
    },
});

store.addActions({
    showDrawer() {
        store.commit("show", true);
    },
    hideDrawer() {
        store.commit("show", false);
    },
    toggleDrawer() {
        store.commit("show", !store.state.show);
    },
    soloMode(flag) {
        store.commit("sole", flag);
    },
});

export default store;