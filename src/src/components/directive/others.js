import utils from '../../common/utils';

export default {
    focus: {
        inserted: function(el) {
            let input;
            if (el.tagName == "input")
                input = el;
            else {
                let rows = el.querySelectorAll(`input,textarea,select,[contenteditable='true']`);
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if (row.offsetWidth * row.offsetHeight > 0) {
                        input = row;
                        break;
                    }
                }
            }
            if (input) input.focus();
        }
    },
    blur: {
        bind: function(el, binding) {
            el._onblur = function(e) {
                if (typeof binding.value === "function") {
                    if (e.target != el && !utils.hasParent(e.target, el))
                        binding.value();
                }
            };
            document.addEventListener('click', el._onblur);
        },
        unbind: function(el) {
            document.removeEventListener('click', el._onblur);
        }
    }
};