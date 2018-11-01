<template>
	<i-chart :option="option"></i-chart>
</template>
<script>
import echarts from 'echarts';
import filter from '../filter.js'

export default {
	name: "IChartTime",
	props: {
		title: String,
		data: { type: Array, required: true },
		labels: { type: Array }, // {key:string, title:string}
		axis: { type: String, required: true },
		type: { type: String, default: 'line' },
		smooth: { type: Boolean },
		formatter: {},
	},
	data() {
		return {
			option: null,
		}
	},
	computed: {
		_formatter() {
			if (!this.formatter) return
			if (typeof this.formatter === "function") return this.formatter
			return value => filter.format(value, this.formatter)
		}
	},
	methods: {
		/**
		 * 基础的echart配置
		 * @param {string} title 
		 */
		baseOption(title, end) {
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
						dataView: {},
						magicType: {
							type: ['line', 'bar']
						},
						restore: {},
						// saveAsImage: {},
					},
				},
				dataZoom: [
					{ start: 0, end: end || 100 },
					{ type: 'inside' },
				],
				xAxis: {
					type: 'time',
					axisLabel: {
						formatter: null
					}
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
			let formatter
			let fn
			if (data.length) {
				let time = data[data.length - 1][axis]
				if (typeof time === 'number') {
					if (time < 1e12) {
						time *= 1e3
						fn = x => x * 1e3
					}
					if (time < 3600e3) formatter = value => filter.format(value, 'mm:ss')
					else if (time < 86400e3) formatter = value => filter.format(value, 'hh:mm:ss')
				}
			}
			let series = Array.from(labels).map(x => ({ name: x.title, data: data.map(row => [fn ? fn(row[axis]) : row[axis], row[x.key]]) }));
			return { legend, series, formatter };
		},
		refresh() {
			let option = this.baseOption(this.title, Math.floor(1e4 / this.data.length))
			let data = this.build(this.data, this.labels, this.axis)
			option.legend.data = data.legend
			data.series.forEach(x => {
				x.type = this.type
				x.smooth = this.smooth
			})
			option.series = data.series
			option.xAxis.axisLabel.formatter = this._formatter || data.formatter
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