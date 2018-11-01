<template>
	<mu-container class="pages-setting">
		<h3>说明:</h3>
		<ol>
			<li>系统会在本地记录最近上传的50张图片,如果想记录更多的图片请设置密钥</li>
			<li>密钥: 查找上传图片的唯一凭证,请尽量保证不会重复,您可以从<a href="http://www.uuid.online/" target="_blank">这里</a>随机生成,当然你也可以选择留空,这样你将无法通过本系统找回上传的图片</li>
			<li>您可以使用自己的新浪账号上传图片,当然你也可以选择留空,这样将使用系统账号</li>
		</ol>
		<mu-form ref="form" :model="body" label-position="top">
			<mu-form-item prop="token" label="密钥">
				<mu-text-field v-model="body.token" :action-icon="token_v?'visibility_off':'visibility'" :action-click="()=>token_v=!token_v" :type="token_v?'text':'password'" :max-length="37"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="username" label="新浪账号" :rules="rule.need">
				<mu-text-field v-model="body.username"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="passwd" label="新浪密码" :rules="rule.need">
				<mu-text-field v-model="body.passwd" :action-icon="passwd_v?'visibility_off':'visibility'" :action-click="()=>passwd_v=!passwd_v" :type="passwd_v?'text':'password'"></mu-text-field>
			</mu-form-item>
		</mu-form>
		<div class="tar">
			<mu-button color="primary" @click="onSave">保存</mu-button>
		</div>
	</mu-container>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class Setting extends Vue {
	@State(state => state.user.user) user
	token_v = false
	passwd_v = false
	body = {}
	rule = {
	}

	created() {
		this.updateBody()
	}
	@Watch('user')
	updateBody() {
		this.body = Object.assign({}, this.user)
	}

	@Action('login') login;
	onSave() {
		let { token, username, passwd } = this.body
		this.login({ token, username, passwd })
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
.pages-setting {
}
</style>
