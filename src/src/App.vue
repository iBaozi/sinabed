<template>
	<div id="app">
		<mu-appbar color="grey900">
			<router-link class="btn" tag="span" to="/">sl图床</router-link>
			<mu-button to="/" flat slot="right">上传</mu-button>
			<mu-button to="history" flat slot="right">历史</mu-button>
			<mu-button to="setting" flat slot="right">设置</mu-button>
			<mu-button to="api" flat slot="right">接口</mu-button>
			<mu-button @click="go('http://perpay.inu1255.cn/donate/2?page=1')" flat slot="right">捐赠</mu-button>
			<mu-button @click="go('https://gitee.com/inu1255/sinabed/issues')">反馈</mu-button>
		</mu-appbar>
		<div class="main">
			<keep-alive>
				<router-view />
			</keep-alive>
		</div>
		<footer class="tac">
			Copyright Ⓒ 2018 inu1255. All rights reserved. 请勿上传违反中国大陆和香港法律的图片，违者后果自负。
		</footer>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";

@Component()
export default class App extends Vue {
	go(url) {
		window.open(url)
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.main {
  padding-bottom: 65px;
}
footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #f5f5f5;
  line-height: 60px;
  color: #999;
}
</style>
