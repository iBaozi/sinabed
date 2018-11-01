import Vue from 'vue';
import utils from '../../common/utils';

Vue.directive('select', {
    bind(el, binding, vnode, oldVnode) {
        function fn() {
            utils.selectNode(el);
		}
		function leave() {
			window.getSelection().removeAllRanges();
		}
        el.addEventListener('mouseenter', fn);
        el.addEventListener('mouseleave', leave);
        vnode.context.$once('hook:beforeDestroy', function() {
            el.removeEventListener('mouseenter', fn);
            el.removeEventListener('mouseleave', leave);
        });
    },
});