import store from '../index';

export class Storage {
    constructor(name, state) {
        this.state = Object.assign({}, state);
        this.name = name;
        this.getters = {};
        this.actions = {};
        this.mutations = {};
        this._mutations(this.name, this.state, true);
    }
    _mutations(path, state, flag) {
        if (state && typeof state == "object" && !(state instanceof Array)) {
            for (let k in state) {
                let v = state[k];
                this._mutations(path + "." + k, v);
            }
        }
        if (!flag) {
            this.addMutations({
                [path]: function(state, data) {
                    let ss = path.split(".");
                    for (let i = 1; i < ss.length - 1; i++) {
                        state = state[ss[i]];
                    }
                    state[ss[ss.length - 1]] = data;
                }
            }, true);
        }
    }
    commit(type, payload) {
        store.commit(this.name + "." + type, payload);
    }
    addGetters(getters) {
        this.getters = Object.assign(this.getters, getters);
        return this;
    }
    addActions(actions) {
        this.actions = Object.assign(this.actions, actions);
        return this;
    }
    addMutations(mutations, clone) {
        if (clone) this.mutations = Object.assign(this.mutations, mutations);
        else
            for (let k in mutations)
                this.mutations[this.name + "." + k] = mutations[k];
        return this;
    }
}

export class LocalStorage extends Storage {
    constructor(name, state) {
        super(name, state);
        let v = localStorage.getItem(this.name);
        if (v) {
            try {
                this.state = Object.assign(this.state, JSON.parse(v));
            } catch (error) {}
        }
    }
    addMutations(mutations, clone) {
        for (let k in mutations) {
            let v = mutations[k];
            this.mutations[clone ? k : (this.name + '.' + k)] = (state, data) => {
                v(state, data);
                localStorage.setItem(this.name, JSON.stringify(state));
            };
        }
        return this;
    }
}