<template>
	<span title="点击查看/隐藏" @click="$emit('update:open',!open)">{{text}}</span>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class IHide extends Vue {
	@Prop({ type: String, required: true }) value;
	@Prop({ type: String, default: '*' }) char;
	@Prop({ type: Boolean }) open;
	get text() {
		if (this.open) return this.value
		return Array.from(this.value).fill(this.char).join('')
	}
}
</script>