<template>
	<div class="i-editor-menu_backColor group">
		<span class="btn i i-fill" title="背景颜色" :style="{backgroundColor:color}" @click="backColor"></span>
		<span class="btn i i-triangle" @click="show=true"></span>
		<i-color v-model="color" :show.sync="show"></i-color>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator';
import IColor from './_IColor.vue';

@Component({ components: { IColor } })
export default class BackColor extends Vue {
	@Inject('editor') editor;
	active = false
	show = false
	color = '#ffff00'
	@Watch('color')
	backColor() {
		this.editor.execCommand('backColor', this.color)
	}
}
</script>