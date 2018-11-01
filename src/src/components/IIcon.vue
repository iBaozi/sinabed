<template>
	<i class="i" @click="$emit('click')" :class="cls" :style="style"></i>
</template>
<script>
export default {
	props: {
		value: {
			type: String,
			required: true
		},
		size: [Number, String],
		rotate: Number,
		loading: Boolean,
	},
	computed: {
		style() {
			let style = {}
			if (this.size) style.fontSize = /\d$/.test(this.size) ? this.size + 'px' : this.size
			if (this.rotate) style.transform = `rotate(${this.rotate}deg)`
			return style
		},
		cls() {
			let cls = {}
			cls['i-' + this.value] = true
			if (this.loading) cls.loading = true
			return cls
		}
	}
}
</script>
<style lang="less" scoped>
@import "~@/styles/methods.less";
i.i-icon {
  transition: transform 0.5s;
  &.loading {
    .loading;
  }
}
</style>

