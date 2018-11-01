<template>
	<div class="i-editor-menu_clear" @click="removeFormat">
		<span class="btn i i-eraser" title="清除格式"></span>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator';

@Component
export default class Clear extends Vue {
	@Inject('editor') editor;
	removeFormat() {
		this.editor.execCommand('removeFormat')
	}
}
</script>