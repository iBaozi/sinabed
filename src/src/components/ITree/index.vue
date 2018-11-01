<template>
	<div class="i-tree">
		<branch :data="data"></branch>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch, Model, Provide } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import Branch from './Branch'
import utils from '../../common/utils';

@Component({ components: { Branch } })
export default class ITree extends Vue {
	@Provide('i-tree-value')
	@Prop({ type: Array }) value; // 选中目标
	@Prop({ type: Array, required: true }) data; // 节点树数据
	@Prop({ type: String, default: 'children' }) k; // 孩子在data中的key
	@Prop() dropMode; // drop方式: 0-只能拖动到本身 1-可以拖动到本身及上下方
	@Prop(Function) load; // 加载数据函数,返回 Promise
	@Prop(Boolean) multiple; // 是否多选
	@Prop(Boolean) draggable; // 拖动
	@Prop(Boolean) contentToggle; // 点击内容也展开
	@Provide('i-tree-root')
	get root() {
		return this
	}
	created() {
		this.nMap = {} // id -> branch vm
	}
	drag(data) { // 拖动开始
		this.i_drag = data
	}
	drop(type, parent, data, i) { // 拖动结束
		this.$emit("drop", { from: this.i_drag, to: data, parent, type, i })
		if (type != "center") {
			data = parent
			if (type == "bottom") {
				i++
			}
		} else {
			i = -1
		}
		this.$emit('move', { from: this.i_drag, to: data, i })
	}
	add(id, nodes) {
		if (nodes instanceof Array) {
			let data = typeof id === "number" ? this.nMap[id] : id
			if (data) {
				this.$set(data, this.root.k, nodes)
			}
		}
	}
	toggleChecked(id) {
		let vm = this.nMap[id]
		if (vm) vm.toggleChecked()
	}
	toggle(id) {
		let vm = this.nMap[id]
		if (vm) vm.toggle(true)
	}
	open(id) {
		let vm = this.nMap[id]
		if (vm) {
			if (!vm.i_open) vm.toggle(true)
		}
	}
	close(id) {
		let vm = this.nMap[id]
		if (vm) {
			if (vm.i_open) vm.toggle(true)
		}
	}
	mounted() {
		window.tree = this
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-tree {
}
</style>
