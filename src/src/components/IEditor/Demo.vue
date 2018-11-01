<template>
	<div class="i-editor-demo">
		<IEditor ref="editor" :value="content" :toURL="toURL">
			<clear></clear>
			<split></split>

			<align-left></align-left>
			<align-center></align-center>
			<align-right></align-right>
			<indent></indent>
			<unindent></unindent>
			<order-list></order-list>
			<unorder-list></unorder-list>
			<block-quote></block-quote>
			<split></split>

			<bold></bold>
			<italic></italic>
			<underline></underline>
			<strike-through></strike-through>
			<Supscript></Supscript>
			<subscript></subscript>
			<split></split>

			<heading></heading>
			<font-name></font-name>
			<font-size></font-size>
			<font-color></font-color>
			<back-color></back-color>
			<split></split>

			<create-link></create-link>
			<insert-image :toURL="toURL"></insert-image>
			<emoji></emoji>
		</IEditor>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import {
	IEditor,
	Clear,
	Split,
	// 段落样式
	AlignLeft,
	AlignCenter,
	AlignRight,
	Indent,
	Unindent,
	OrderList,
	UnorderList,
	BlockQuote,
	// 字体样式
	Bold,
	Italic,
	Underline,
	StrikeThrough,
	Supscript,
	Subscript,
	Horizontal,
	// 颜色样式
	Heading,
	FontName,
	FontSize,
	FontColor,
	BackColor,
	// 其它
	CreateLink,
	InsertImage,
	Emoji
} from './index'

@Component({
	components: {
		IEditor,
		Clear,
		Split,
		// 段落样式
		AlignLeft,
		AlignCenter,
		AlignRight,
		Indent,
		Unindent,
		OrderList,
		UnorderList,
		BlockQuote,
		// 字体样式
		Bold,
		Italic,
		Underline,
		StrikeThrough,
		Supscript,
		Subscript,
		Horizontal,
		// 颜色样式
		Heading,
		FontName,
		FontSize,
		FontColor,
		BackColor,
		// 其它
		CreateLink,
		InsertImage,
		Emoji
	}
})
export default class Demo extends Vue {
	content = []
	async toURL(file) {
		let form = new FormData()
		form.append('f', file)
		let { url } = await this.$post('file/image', form)
		return url
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-editor-demo {
}
</style>
