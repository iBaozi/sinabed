export default {
    props: {
        disabled: { type: Boolean, default: false },
        value: { default () { return []; } },
    },
    computed: {
        content() {
            let content = this.value instanceof Array ? JSON.stringify(this.value) : this.value;
            try {
                content = JSON.parse(content);
            } catch (error) {}
            return Object.freeze(content);
        }
    },
    render(h) {
        let contentProps = { class: { 'i-editor-content': true, 'scrollY': true, }, attrs: { contenteditable: !this.disabled, drop: true, } };
        if (!this.disabled) {
            contentProps.on = { keyup: this.keyup, keydown: this.keydown, click: this.click, blur: this.blur, paste: this.paste, drop: this.drop };
        }
        return h('div', contentProps, this.renderElem(this.content, h));
    },
    methods: {
        renderElem(data, h, isMapping) {
            if (data instanceof Array) {
                if (isMapping) {
                    let tag = data[0];
                    let props = data[1];
                    let v;
                    if (data.length < 3) {
                        if (props instanceof Array) {
                            v = props;
                            props = {};
                        } else if (typeof props === "string") {
                            v = [props];
                            props = {};
                        }
                    } else {
                        props = data[1];
                        v = data[2];
                    }
                    if (tag.indexOf('-') >= 0) {
                        props = props || {};
                        props.attrs = props.attrs || {};
                        props.attrs['editor-data'] = JSON.stringify(data);
                        props.attrs.contenteditable = false;
                    }
                    if (v) return h(tag, props, this.renderElem(v, h, 0));
                    return h(tag, props);
                }
                return data.map(x => this.renderElem(x, h, 1));
            }
            return data;
        },
        keydown(e) {
            this.$emit('keydown', e);
        },
        keyup(e) {
            this.$emit('keyup', e);
        },
        click() {
            this.$emit('click');
        },
        blur() {
            this.$emit('blur');
        },
        paste(e) { // 粘贴图片、链接等
            this.$emit('paste', e);
        },
        drop(e) {
            this.$emit('drop', e);
        },
        /**
         * @param {HTMLElement} node 
         */
        getAttr(node) {
            var attr = {};
            var ok = false;
            for (let item of node.attributes) {
                ok = true;
                attr[item.name] = item.value;
            }
            return ok ? attr : undefined;
        },
        getData(nodes) {
            nodes = nodes || this.$el.childNodes;
            let data = [];
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.nodeType == 1) {
                    let c = node.getAttribute('editor-data');
                    if (c) {
                        data.push(JSON.parse(c));
                    } else {
                        let attrs = this.getAttr(node);
                        let item = [node.tagName];
                        if (attrs) item.push({ attrs });
                        let children = this.getData(node.childNodes);
                        if (children) item.push(children);
                        data.push(item);
                    }
                } else {
                    data.push(node.data);
                }
            }
            if (data.length == 1 && typeof data[0] === "string") return data[0];
            if (data.length) return data;
        },
    }
};