<template>
	<mu-container class="pages-api">
		<h1>接口说明:</h1>
		<pre>
	接口一般返回格式 {"no":响应代码,"msg":错误信息,data:返回数据} 其中响应代码=200时代表请求成功，否则会返回msg
	所有接口支持跨域访问
		</pre>
		<div v-for="(api,i) in list" :key="i" class="api">
			<h1>{{api.name}}接口</h1>
			<mu-divider></mu-divider>
			<h3>地址: <a :href="api.url">{{api.url}}</a></h3>
			<h3>方法: {{api.method}}</h3>
			<h3>参数:</h3>
			<mu-data-table v-if="api.params&&api.params.length" :columns="columns" :data="api.params">
				<template slot-scope="{row}">
					<td>{{row.key}}</td>
					<td>{{row.lbl}}</td>
					<td>{{row.type?row.type:'string'}}</td>
					<td>{{row.need?'是':'否'}}</td>
					<td>{{row.rem}}</td>
				</template>
			</mu-data-table>
			<h3 v-if="api.error&&api.error.length">错误代码:</h3>
			<mu-data-table v-if="api.error&&api.error.length" :columns="[{title:'代码',width:96},{title:'含意'}]" :data="api.error">
				<template slot-scope="{row}">
					<td>{{row.key}}</td>
					<td>{{row.msg}}</td>
				</template>
			</mu-data-table>
			<h3>返回示例:</h3>
			<pre>{{api.ret}}</pre>
		</div>
	</mu-container>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';
import config from '../common/config';

@Component()
export default class Api extends Vue {
	columns = [{
		title: '参数',
		width: 120,
	}, {
		title: '参数名',
		width: 120,
	}, {
		title: '参数类型',
		width: 96,
	}, {
		title: '是否必传',
		width: 96,
	}, {
		title: '参数说明',
	}]

	get list() {
		return utils.apis.map(x => {
			x = Object.assign({}, x)
			let params = []
			for (let k in x.params) {
				let v = x.params[k]
				v.key = k
				v.rem = v.rem || ''
				if (v.opts) v.rem += v.opts.map((x, i) => `${i}:${x}`).join('\n')
				params.push(v)
			}
			let error = []
			for (let k in x.error) {
				let v = x.error[k]
				error.push({ key: k, msg: v })
			}
			x.error = error
			x.params = params
			x.ret = JSON.stringify(x.ret, null, 2)
			x.rem = x.rem || ''
			x.url = config.api + '/api/file/' + x.url
			return x
		})
	}
	async refresh() {

	}
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-api {
}
</style>
