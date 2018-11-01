import { LocalStorage } from "./storage";

const store = new LocalStorage("history", {
    list: []
});

store.addActions({
    async addPhoto(_, body) {
        store.commit("list", store.state.list.concat([body]));
    },
});

export default store;