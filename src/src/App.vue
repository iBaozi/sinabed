<template>
	<div id="app">
		<mu-appbar color="grey900">
			<router-link class="btn" tag="span" to="/">sl图床</router-link>
			<mu-button to="/" flat slot="right">上传</mu-button>
			<mu-button to="history" flat slot="right">历史</mu-button>
			<mu-button to="setting" flat slot="right">设置</mu-button>
			<mu-button to="api" flat slot="right">接口</mu-button>
			<mu-button to="http://perpay.inu1255.cn/donate/1?page=1&n=1" flat slot="right">捐赠</mu-button>
		</mu-appbar>
		<div class="main">
			<mu-scale-transition>
				<keep-alive>
					<router-view />
				</keep-alive>
			</mu-scale-transition>
		</div>
		<footer class="tac">
			Copyright Ⓒ 2018 inu1255. All rights reserved. 请勿上传违反中国大陆和香港法律的图片，违者后果自负。
		</footer>
	</div>
</template>
<style lang="less">
@import "~@/styles/methods.less";

.app-title {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 101;
  overflow: hidden;
  ~ .container {
    margin-top: 65px;
  }
}
.main {
  > * {
    transition: all 0.35s;
  }
  > .mu-scale-transition-leave-active.mu-scale-transition-leave-to {
    position: absolute;
  }
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
