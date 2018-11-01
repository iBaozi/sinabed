/**
 * @param {string} cmd execCommand
 * @param {string} title 
 * @param {string} icon 图标
 * @param {(selection:Editor)=>boolean} isActive 
 */
export default function(cmd, title, icon, isActive, fn) {
    return {
        inject: ['editor'],
        render(h) {
            let vue = this;
            return h('div', {
                class: this.cls,
                on: {
                    click(e) {
                        if (fn) fn(vue.editor);
                        else vue.editor.execCommand(cmd, vue.active);
                    }
                }
            }, [h('span', {
                class: 'btn i i-' + (icon || cmd),
                attrs: {
                    title: title
                }
            })]);
        },
        data() {
            return {
                active: false,
            };
        },
        computed: {
            cls() {
                return {
                    ['i-editor-menu_' + cmd]: true,
                    active: this.active
                };
            }
        },
        methods: {
            status() {
                this.active = isActive ? isActive(this.editor) : document.queryCommandState(cmd);
            }
        },
        mounted() {
            this.editor.pushActive(this.status);
        }
    };
}