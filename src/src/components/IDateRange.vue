<template>
	<div class="components-date-range">
		<span v-show="m_type">
			<mu-button icon color="primary" @click="add(-1)">
				<mu-icon value="chevron_left"></mu-icon>
			</mu-button>
			<mu-button ref="button" @click="open=!open" flat>{{text}}</mu-button>
			<mu-popover :open.sync="open" :trigger="trigger">
				<mu-date-picker :date="endDate" @update:date="setEnd"></mu-date-picker>
			</mu-popover>
			<mu-button icon color="primary" @click="add(1)">
				<mu-icon value="chevron_right"></mu-icon>
			</mu-button>
		</span>
		<span>
			<mu-radio v-if="all" label="不限" v-model="m_type" value=""></mu-radio>
			<mu-radio label="日" v-model="m_type" value="day"></mu-radio>
			<mu-radio label="周" v-model="m_type" value="week"></mu-radio>
			<mu-radio label="月" v-model="m_type" value="month"></mu-radio>
			<mu-radio label="年" v-model="m_type" value="year"></mu-radio>
		</span>
		<slot></slot>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch, Model } from 'vue-property-decorator';
import dayjs from 'dayjs';

@Component()
export default class DateRange extends Vue {
	@Prop({ type: String, default: 'day' }) type;
	@Prop({ type: Object, default() { return { day: '日', week: '周', month: '月', year: '年' } } }) lang;
	@Prop({ type: Boolean, default: false }) all;
	@Prop() max;
	@Prop() min;
	open = false
	trigger = null
	end = dayjs()
	m_type = null
	@Watch('type')
	changeType() {
		this.m_type = this.type
	}
	@Watch('m_type')
	watchType(to, from) {
		if (from != null) this.change()
		this.$emit('update:type', this.m_type)
	}
	created() {
		this.m_type = this.type == null ? 'week' : this.type
	}
	get maxLimit() {
		if (this.max == "now") return dayjs().endOf(this.m_type)
		if (/^to/.test(this.max)) return dayjs().endOf(this.max.slice(2))
		return this.max ? dayjs(this.max) : 0
	}
	get minLimit() {
		if (this.min == "now") return dayjs().startOf(this.m_type)
		if (/^to/.test(this.min)) return dayjs().startOf(this.min.slice(2))
		return this.min ? dayjs(this.min) : 0
	}
	get endDate() {
		return this.end.toDate()
	}
	get endToday() {
		return dayjs().endOf(this.m_type)
	}
	get text() {
		let diff = this.end.diff(this.endToday, this.m_type + 's')
		let unit = this.lang[this.m_type]
		if (!diff) return '本' + unit
		let prefix = diff < 0 ? '上' : '下'
		return prefix + Math.abs(diff) + unit
	}
	setEnd(v) {
		let end = dayjs(v).endOf(this.m_type)
		if (this.maxLimit && this.maxLimit.isBefore(end)) end = this.maxLimit
		let min = max.add(-1, this.m_type)
		if (this.minLimit && this.minLimit.isAfter(min)) end = this.minLimit.add(1, this.m_type)
		this.end = end
		this.change()
		this.open = false
	}
	add(n) {
		let max = this.end.endOf(this.m_type).add(+n || 0, this.m_type)
		if (this.maxLimit && this.maxLimit.isBefore(max)) return
		let min = max.add(-1, this.m_type)
		if (this.minLimit && this.minLimit.isAfter(min)) return
		this.end = max
		this.change()
	}
	change() {
		let { max, min } = this.getRange()
		this.$emit('change', max, min, this.m_type)
	}
	getRange() {
		if (!this.m_type) return {}
		let max = this.end.endOf(this.m_type)
		if (this.maxLimit && this.maxLimit.isBefore(max)) {
			max = this.maxLimit
		}
		let min = max.add(-1, this.m_type)
		if (this.minLimit && this.minLimit.isAfter(min)) {
			min = this.minLimit
		}
		max = max ? max.valueOf() : max
		min = min ? min.valueOf() : min
		return { max, min }
	}
	mounted() {
		this.trigger = this.$refs.button.$el
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.components-date-range {
  text-align: right;
  height: 50px;
  > span {
    white-space: nowrap;
    display: inline-block;
    line-height: 48px;
  }
  .mu-button {
    vertical-align: middle;
  }
  .mu-radio {
    vertical-align: middle;
  }
}
</style>
