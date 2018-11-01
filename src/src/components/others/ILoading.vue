<template>
	<svg viewBox="25 25 50 50" class="others-i-loading">
		<circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
	</svg>
</template>
<script>
export default {
	name: "ILoading",
	data() {
		return {

		}
	},
	computed: {

	},
	methods: {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.others-i-loading {
  height: 42px;
  width: 42px;
  animation: loading-rotate 2s linear infinite;
  .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: #409eff;
    stroke-linecap: round;
  }
}
</style>
