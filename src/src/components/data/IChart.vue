<template>
	<div class="i-chart"></div>
</template>
<script>
import echarts from 'echarts';

export default {
	name: "IChart",
	props: {
		option: Object,
	},
	watch: {
		option() {
			this.chart.setOption(this.option);
		}
	},
	mounted() {
		this.chart = echarts.init(this.$el)
		if (this.option) this.chart.setOption(this.option);
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-chart {
  display: inline-block;
  width: 100%;
  height: 100%;
}
</style>
