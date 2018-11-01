import Vue from 'vue';
import utils from '../../common/utils';

Vue.directive('blur', {
    bind(el, binding, vnode) {
        function fn(e) {
            if (typeof binding.value === "function") {
                if (e.target != el && !utils.hasParent(e.target, el))
                    binding.value();
            }
        }
        el.addEventListener('click', fn);
        vnode.context.$once('hook:beforeDestroy', function() {
            el.removeEventListener('click', fn);
        });
    },
});