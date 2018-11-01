<template>
	<i-chart :option="option"></i-chart>
</template>
<script>
import echarts from 'echarts';

export default {
	name: "IChartBar",
	props: {
		title: String,
		data: { type: Array, required: true },
		labels: { type: Array }, // {key:string, title:string}
		axis: String,
		type: { type: String, default: 'line' },
		smooth: { type: Boolean },
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
					trigger: 'axis',
				},
				legend: {
					data: []
				},
				toolbox: {
					feature: {
						// dataZoom: {
						//     yAxisIndex: 'none'
						// },
						dataView: {},
						magicType: {
							type: ['line', 'bar'] //, 'stack', 'tiled']
						},
						// brush: {},
						restore: {},
						// saveAsImage: {},
					},
					// orient: 'vertical'
				},
				dataZoom: [
					{ start: 0, end: end || 100 },
					{ type: 'inside' }
				],
				xAxis: {
					data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
				},
				yAxis: {},
				series: []
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
			let legend = labels.map(x => x.title);
			let xAxis = data.map((x, i) => axis == null ? i : x[axis]);
			let series = Array.from(labels).map(x => ({ name: x.title, data: data.map(row => row[x.key]) }));
			return { legend, xAxis, series };
		},
		refresh() {
			let option = this.baseOption(this.title, Math.floor(1e4 / this.data.length))
			let data = this.build(this.data, this.labels, this.axis)
			option.xAxis.data = data.xAxis
			option.legend.data = data.legend
			data.series.forEach(x => {
				x.type = this.type
				x.smooth = this.smooth
			})
			option.series = data.series
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