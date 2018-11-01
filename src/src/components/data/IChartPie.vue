<template>
	<i-chart :option="option"></i-chart>
</template>
<script>
import echarts from 'echarts';
import math from '../../common/math'

export default {
	name: "IChartPie",
	props: {
		title: String,
		data: { type: Array, required: true },
		labels: { type: Array }, // {key:string, title:string}
		label: { type: String, default: 'hide' },
		legend: { type: Boolean, default: true }
	},
	data() {
		return {
			option: null
		}
	},
	computed: {

	},
	methods: {
		/**
		 * 基础的echart配置
		 * @param {string} title 
		 */
		baseOption(title) {
			return {
				title: {
					text: title
				},
				tooltip: {
					trigger: 'item',
					formatter: "{b}: {c} ({d}%)"
				},
				legend: {
					orient: 'vertical',
					x: 'left',
					data: []
				},
				series: [{
					name: title,
					type: 'pie',
					label: {
						show: this.label == 'hide',
						normal: {
							position: this.label
						}
					},
					data: []
				}]
			};
		},
		/**
		 * 通过 data, labels 生成 echart 需要的数据
		 * @param {Array} data 数据，每一项是一个对象
		 * @param {{key:string,title:string}[]} labels 每一项的含义
		 * @param {number} axis x轴是哪一列
		 */
		build(data, labels, axis) {
			if (!labels) {
				labels = [];
				for (let k in data[0]) {
					labels.push({ key: k, title: k });
				}
			}

			let series = labels.map(label => {
				let value = data.map(row => row[label.key])
				let fn = typeof label.reduce == 'function' ? label.reduce : math[label.reduce] || math.sum
				return { name: label.title, value: fn(value) }
			});
			let legend = labels.map(label => label.title)
			return { series, legend }
		},
		refresh() {
			let option = this.baseOption(this.title)
			let ret = this.build(this.data, this.labels)

			option.series[0].data = ret.series
			option.legend.data = this.legend ? ret.legend : []
			this.option = option
		}
	},
	watch: {
		data() {
			this.refresh()
		}
	},
	components: {

	},
	mounted() {
		this.refresh()
	}
}
</script>