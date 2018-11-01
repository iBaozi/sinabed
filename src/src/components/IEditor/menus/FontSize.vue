<template>
	<div class="i-editor-menu_fontSize">
		<span class="btn i i-font-size" title="字号" @click="focus"></span>
		<div class="abs" style="line-height:1.2;white-space:nowrap;" v-show="show" tabindex="1" @blur="show=false">
			<div class="item" @click="fontSize('')">（默认字号）</div>
			<div v-for="font in fonts" :key="font" class="item" :style="{fontSize:font}" @click="fontSize(font)">字号（{{font}}）</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "FontSize",
	inject: ['editor'],
	props: {
		fonts: {
			type: Array,
			default() {
				return ["12", "13", "14", "15", "16", "19.2", "25.6", "38.4"].map(x => x + 'px')
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
			this.show = !this.show
			this.$nextTick(_ => this.abs.focus())
		},
		fontSize(font) {
			this.editor.fontSize(font)
			this.show = false
		}
	},
	mounted() {
		this.abs = this.$el.querySelector('.abs')
	}
}
</script>