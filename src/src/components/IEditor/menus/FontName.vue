<template>
	<div class="i-editor-menu_fontName">
		<span class="btn i i-font" title="字体" @click="focus"></span>
		<div class="abs" style="line-height:1.2;white-space:nowrap;" v-show="show" tabindex="1" @blur="show=false">
			<div class="item" @click="fontName('')">（默认字体）</div>
			<div v-for="font in fonts" :key="font" class="item" :style="{fontFamily:font}" @click="fontName(font)">{{font}}</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "Clear",
	inject: ['editor'],
	props: {
		fonts: {
			type: Array,
			default() {
				return [
					"Tahoma, 微软雅黑",
					"宋体",
					"仿宋, 仿宋_GB2312",
					"楷体, 楷体_GB2312",
					"黑体",
					"Arial",
					"Arial Black",
					"Courier New",
					"Tahoma",
					"Times New Roman",
				]
			}
		}
	},
	data() {
		return {
			show: false
		}
	},
	methods: {
		focus() {
			this.show = true
			this.$nextTick(_ => this.abs.focus())
		},
		fontName(font) {
			this.editor.fontName(font)
			this.show = false
		}
	},
	mounted() {
		this.abs = this.$el.querySelector('.abs')
	}
}
</script>