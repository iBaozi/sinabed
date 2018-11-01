<template>
	<mu-dialog width="360" :overlay-opacity="0.9" overlay-color="#fff" fullwidth :open="Boolean(open)">
		<mu-tabs :value.sync="tab" inverse color="secondary" text-color="rgba(0, 0, 0, .54)" center>
			<mu-tab>登录</mu-tab>
			<mu-tab>注册</mu-tab>
		</mu-tabs>
		<mu-form v-if="tab==0" ref="log" :model="body" label-position="top">
			<mu-form-item prop="title" label="用户名/邮箱" :rules="rule.need">
				<mu-text-field v-model="body.title"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="passwd" label="密码" :rules="rule.passwd">
				<mu-text-field v-model="body.passwd" @keyup.enter="onSubmit(body)" :action-icon="visibility ? 'visibility_off' : 'visibility'" :action-click="() => (visibility = !visibility)" :type="visibility ? 'text' : 'password'"></mu-text-field>
			</mu-form-item>
		</mu-form>
		<mu-form v-if="tab==1" ref="reg" :model="body" label-position="top">
			<mu-form-item prop="account" label="账号(不能修改)" :rules="rule.need">
				<mu-text-field v-model="body.account"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="title" label="邮箱" :rules="rule.email">
				<mu-text-field v-model="body.title">
					<mu-button v-loading="body.loading" @click="sendCode(body)" slot="append" flat :disabled="disabled">{{body.s?body.s+'秒':'获取验证码'}}</mu-button>
				</mu-text-field>
			</mu-form-item>
			<mu-form-item prop="code" label="邮箱验证码" :rules="rule.need">
				<mu-text-field v-model="body.code"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="passwd" label="密码" :rules="rule.passwd">
				<mu-text-field v-model="body.passwd" :action-icon="visibility ? 'visibility_off' : 'visibility'" :action-click="() => (visibility = !visibility)" :type="visibility ? 'text' : 'password'"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="invite" label="邀请码">
				<mu-text-field v-model="body.invite"></mu-text-field>
			</mu-form-item>
		</mu-form>
		<mu-button slot="actions" flat color="primary" @click="onSubmit(body)">提交</mu-button>
	</mu-dialog>
</template>
<script>
import { mapState, mapActions } from "vuex";
import utils from '../common/utils';

export default {
	name: "NodeForm",
	props: ["open"],
	data() {
		return {
			tab: 0,
			body: {
				s: '',
				title: '',
				account: '',
				passwd: '',
				code: '',
			},
			rule: {
				email: utils.rule('need', 'email'),
				passwd: utils.rule('need', 'passwd'),
				need: utils.rule('need'),
			},
			visibility: false,
		}
	},
	computed: {
		disabled() {
			return Boolean(!this.body.title || this.body.s || !utils.isEmail(this.body.title))
		},
	},
	methods: {
		...mapActions(['login', 'register']),
		onSubmit(body) {
			if (this.tab)
				this.$refs.reg.validate().then((result) => {
					if (result) {
						body.name = body.account
						return this.register(body)
					}
				});
			else
				this.$refs.log.validate().then((result) => {
					if (result) return this.login(body)
				});
		},
		async sendCode(body) {
			await this.$get("user/code_send", body, { loading: true });
			this.toast.succes('发送成功')
			body.s = 61
			let s = () => {
				body.s--
				if (body.s > 0) setTimeout(s, 1e3)
			}
			s()
		},
	},
	components: {

	},
	mounted() {
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-node-form {
}
</style>
