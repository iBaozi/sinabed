<template>
	<div class="i-editor-menu_foreColor group">
		<span class="btn i i-font-color" title="字体颜色" :style="{color:color}" @click="foreColor"></span>
		<span class="btn i i-triangle" @click="show=true" ></span>
		<i-color v-model="color" origin="" :show.sync="show"></i-color>
	</div>
</template>
<script>
import IColor from './_IColor.vue';

export default {
	name: "FontColor",
	inject: ['editor'],
	data() {
		return {
			active: false,
			show: false,
			color: '#ff0000'
		}
	},
	components: {
		IColor
	},
	watch: {
		color() {
			this.foreColor()
		}
	},
	methods: {
		foreColor(){
			this.editor.foreColor(this.color)
		}
	}
}
</script>