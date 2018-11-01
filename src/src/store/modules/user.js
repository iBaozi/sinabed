import { LocalStorage } from "./storage";
import utils from '../../common/utils';

const store = new LocalStorage("user", {
    user: {}
});

store.addActions({
    async login(_, body) {
        store.commit("user", body);
    },
    async logout() {
        store.commit("user", {});
    },
});

export default store;