<template>
	<div class="i-editor-menu_clear" :class="cls" @click="$emit('exec', 'removeFormat')">
		<span title="清除格式">C</span>
	</div>
</template>
<script>
export default {
	name: "Clear",
	data() {
		return {
			active: false
		}
	},
	computed: {
		cls() {
			return { active: this.active }
		}
	},
	methods: {
		status() {
			this.active = document.queryCommandState('removeFormat')
		}
	}
}
</script>