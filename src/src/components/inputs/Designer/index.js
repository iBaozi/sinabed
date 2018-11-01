export default {
    props: ['tree'],
    dfs(h, node) {
        if (!node) return null;
        if (node instanceof Array) {
            return node.map(x => this.dfs(h, x));
        }
        let item = Object.assign({}, node);
        if (node.scopedSlots) {
            item.scopedSlots = {};
            for (let k in node.scopedSlots) {
                let v = node.scopedSlots[k];
                item.scopedSlots[k] = this.dfs(h, v);
            }
        }
        return h(node.name, node);
    },
    render(h) {
        return this.dfs(h, this.tree);
    }
};