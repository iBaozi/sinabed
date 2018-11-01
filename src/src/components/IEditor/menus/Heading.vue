<template>
	<div class="i-editor-menu_heading">
		<span class="btn i i-header" title="标题" @click="focus"></span>
		<div class="abs" style="line-height:1.2;white-space:nowrap;" v-show="show" tabindex="1" @blur="show=false">
			<p class="item" @click="formatBlock('<P>')">段落</p>
			<h1 class="item" @click="formatBlock('<H1>')">一级标题</h1>
			<h2 class="item" @click="formatBlock('<H2>')">二级标题</h2>
			<h3 class="item" @click="formatBlock('<H3>')">三级标题</h3>
			<h4 class="item" @click="formatBlock('<H4>')">四级标题</h4>
			<h5 class="item" @click="formatBlock('<H5>')">五级标题</h5>
			<h6 class="item" @click="formatBlock('<H6>')">六级标题</h6>
		</div>
	</div>
</template>
<script>
export default {
	name: "Heading",
	inject: ['editor'],
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
		formatBlock(font) {
			this.editor.execCommand('formatBlock', font)
			this.show = false
		}
	},
	mounted() {
		this.abs = this.$el.querySelector('.abs')
	}
}
</script>