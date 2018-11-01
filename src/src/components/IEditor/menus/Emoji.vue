<template>
	<div class="i-editor-menu_emoji">
		<span class="btn i i-emoji" title="表情" @click="focus"></span>
		<div class="abs" style="line-height:1.2;font-size:24px;width:240px;padding:9px;z-index:1;" v-show="show" tabindex="1" @blur="show=false">
			<span v-for="font in fonts" :key="font" @click="exec(font)">{{font}}</span>
		</div>
	</div>
</template>
<script>
export default {
	name: "Emoji",
	props: {
		fonts: {
			type: Array,
			default() {
				return Array.from("😀😁😂😃😄😅😆😇😈😉😊😋😌😍😎😏😐😑😒😓😔😕😖😗😘😙😚😛😜😝😞😟😠😡😢😣😤😥😦😧😨😩😪😫😬😭😮😯😰😱😲😳😴😵😶😷😸😹😺😻😼😽😾😿🙀")
			}
		}
	},
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
		exec(font) {
			this.editor.execCommand('insertHTML', font)
			this.show = false
		}
	},
	mounted() {
		this.abs = this.$el.querySelector('.abs')
	}
}
</script>