export default {
    dragData: {
        bind: function(el, binding) {
            if (typeof binding.value === 'function')
                el.ondragstart = binding.value;
            else
                el.ondragstart = function(e) {
                    e.dataTransfer.setData("data", binding.value);
                };
        }
    },
    drag: {
        bind: function(el, binding, vnode) {
            if (typeof binding.value === "function") {
                el.ondragover = function(e) {
                    // event, 是否完成, 数据
                    binding.value(e, false);
                    e.preventDefault();
                };
                el.ondragleave = function(e) {
                    binding.value(e, true);
                };
                el.ondrop = function(e) {
                    binding.value(e, true, e.dataTransfer.getData("data") || true);
                };
            }
        }
    }
};