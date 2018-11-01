<template>
	<div class="pages-user-edit">
		<mu-tabs :value.sync="tab" inverse center>
			<mu-tab>个人信息</mu-tab>
			<mu-tab>修改密码</mu-tab>
		</mu-tabs>
		<mu-form v-show="tab==0" :model="form" ref="form" class="mu-demo-form" label-position="left" label-width="100">
			<mu-form-item prop="name" label="昵称" :rules="rule.need">
				<mu-text-field v-model="form.name"></mu-text-field>
			</mu-form-item>
			<mu-form-item label="邮箱">
				<span>{{form.email}}</span><span v-if="form.email">&nbsp;&nbsp;</span><a @click="email.open=true">{{form.email?'修改':'绑定'}}</a>
			</mu-form-item>
			<!-- <mu-form-item prop="tel" label="手机号">
				<span>{{form.tel}}</span><span v-if="form.tel">&nbsp;&nbsp;</span><a @click="tel.open=true">{{form.tel?'修改':'绑定'}}</a>
			</mu-form-item> -->
			<mu-form-item prop="birth_at" label="生日">
				<mu-date-input v-model="form.birth_at" type="date" actions></mu-date-input>
			</mu-form-item>
			<mu-form-item prop="sex" label="性别">
				<mu-radio v-model="form.sex" :value="1" label="男"></mu-radio>
				<mu-radio v-model="form.sex" :value="2" label="女"></mu-radio>
				<mu-radio v-model="form.sex" :value="0" label="不告诉你"></mu-radio>
			</mu-form-item>
			<mu-form-item prop="profile" label="简介">
				<mu-text-field multi-line :rows="3" :rows-max="6" v-model="form.profile"></mu-text-field>
			</mu-form-item>
			<mu-form-item>
				<mu-button @click="change()" color="primary">保存</mu-button>
			</mu-form-item>
		</mu-form>
		<mu-form v-show="tab==1" :model="form" ref="form" class="mu-demo-form" label-position="left" label-width="100">
			<mu-form-item prop="passwd0" label="旧密码" :rules="rule.passwd">
				<mu-text-field v-model="form.passwd0" :action-icon="v0 ? 'visibility_off' : 'visibility'" :action-click="() => (v0 = !v0)" :type="v0 ? 'text' : 'password'"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="passwd" label="新密码" :rules="rule.passwd">
				<mu-text-field v-model="form.passwd" :action-icon="v1 ? 'visibility_off' : 'visibility'" :action-click="() => (v1 = !v1)" :type="v1 ? 'text' : 'password'"></mu-text-field>
			</mu-form-item>
			<mu-form-item>
				<mu-button @click="change()" color="primary">保存</mu-button>
			</mu-form-item>
		</mu-form>
		<mu-dialog title="绑定邮箱" width="360" :open.sync="email.open">
			<mu-form :model="email" ref="email" label-position="top">
				<mu-form-item prop="title" label="邮箱" :rules="rule.email">
					<mu-text-field v-model="email.title">
						<mu-button v-loading="email.loading" @click="sendCode(email)" slot="append" flat :disabled="email_disable">{{email.s?email.s+'秒':'获取验证码'}}</mu-button>
					</mu-text-field>
				</mu-form-item>
				<mu-form-item prop="c" label="邮箱验证码" :rules="rule.need">
					<mu-text-field v-model="email.c"></mu-text-field>
				</mu-form-item>
			</mu-form>
			<mu-button slot="actions" flat @click="email.open=false">取消</mu-button>
			<mu-button slot="actions" flat color="primary" @click="changeEmail(email)">确定</mu-button>
		</mu-dialog>
		<mu-dialog title="绑定手机号" ref="tel" width="360" :open.sync="tel.open">
			<mu-form :model="tel" label-position="top">
				<mu-form-item prop="title" label="手机号" :rules="rule.tel">
					<mu-text-field v-model="tel.title">
						<mu-button v-loading="tel.loading" @click="sendCode(tel)" slot="append" flat :disabled="tel_disable">{{tel.s?tel.s+'秒':'获取验证码'}}</mu-button>
					</mu-text-field>
				</mu-form-item>
				<mu-form-item prop="c" label="手机验证码" :rules="rule.need">
					<mu-text-field v-model="tel.c"></mu-text-field>
				</mu-form-item>
			</mu-form>
			<mu-button slot="actions" flat @click="tel.open=false">取消</mu-button>
			<mu-button slot="actions" flat color="primary" @click="changeTel(tel)">确定</mu-button>
		</mu-dialog>
	</div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import utils from '../common/utils';

export default {
	name: "UserEdit",
	data() {
		return {
			tab: 0,
			form: {
				passwd0: '',
				passwd: '',
			},
			v0: false,
			v1: false,
			email: { open: false, title: '', err: '', c: '', s: 0, loading: false },
			tel: { open: false, title: '', err: '', c: '', s: 0, loading: false },
			rule: {
				email: utils.rule('need', 'email'),
				tel: utils.rule('need', 'tel'),
				need: utils.rule('need'),
			}
		}
	},
	computed: {
		...mapState({
			user: state => state.user.user,
		}),
		email_disable() {
			return Boolean(this.email.s || !utils.isEmail(this.email.title))
		},
		tel_disable() {
			return Boolean(this.tel.s)
		},
	},
	watch: {
		user() {
			this.form = Object.assign({}, this.user)
		},
	},
	methods: {
		async sendCode(body) {
			await this.$get("user/code_send", body, { loading: true });
			body.s = 61
			let s = () => {
				body.s--
				if (body.s > 0) setTimeout(s, 1e3)
			}
			s()
		},
		async changeEmail(body) {
			let ok = await this.$refs.email.validate()
			if (!ok) return
			await this.$post("user/edit", { email: body.title, ecode: body.c }, { loading: true });
			this.$store.commit('user.user', Object.assign({}, this.user, { email: body.title }))
			body.open = false
		},
		async changeTel(body) {
			let ok = await this.$refs.tel.validate()
			if (!ok) return
			await this.$post("user/edit", { tel: body.title, tcode: body.c }, { loading: true });
			this.$store.commit('user.user', Object.assign({}, this.user, { tel: body.title }))
			body.open = false
		},
		async change(body) {
			let ok = await this.$refs.form.validate()
			if (!ok) return
			let form = utils.clearKeys(this.form, this.user);
			if (form.birth_at) form.birth_at = +form.birth_at
			await this.$post("user/edit", form, { loading: true });
			delete form.passwd
			delete form.passwd0
			this.$store.commit('user.user', Object.assign({}, this.user, form))
			this.$toast.success('修改成功')
			this.form = Object.assign({}, this.user)
		},
	},
	components: {
	},
	mounted() {
		this.form = Object.assign({}, this.user)
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-user-edit {
  margin: auto;
  max-width: 440px;
  padding-top: 3rem;
}
</style>
