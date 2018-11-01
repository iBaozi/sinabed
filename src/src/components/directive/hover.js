import Vue from 'vue';

Vue.directive('hover', {
    bind(el, binding, vnode, oldVnode) {
        function enter() {
			vnode.context[binding.expression] = true;
		}
		function leave() {
			vnode.context[binding.expression] = false;
		}
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        vnode.context.$once('hook:beforeDestroy', function() {
            el.removeEventListener('mouseenter', enter);
            el.removeEventListener('mouseleave', leave);
        });
    },
});