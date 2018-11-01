<template>
	<nav class="components-i-header" :class="cls" :style="{background:bg}">
		<mu-container>
			<div class="navbar-left">
				<mu-button @click="open=!open" icon>
					<i-icon :value="open?'close':'menu'" size="24"></i-icon>
				</mu-button>
			</div>
			<div class="navbar-right">
				<slot name="right"></slot>
			</div>
			<div class="navbar-header">
				<img class="logo" src="@/assets/logo.svg">
				<mu-expand-transition>
					<div v-show="size.md||open" class="menus" :style="{background:bg}">
						<slot></slot>
					</div>
				</mu-expand-transition>
			</div>
		</mu-container>
	</nav>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';
import { ColMixin } from "./mixin";

@Component({ mixins: [ColMixin] })
export default class IHeader extends Vue {
	@Prop({ type: String }) bg
	@Prop({ type: Boolean }) fixed
	open = false
	get cls() {
		return Object.assign({ fixed: this.fixed }, this.size)
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
.components-i-header {
  transition: all 1s ease-in-out;
  width: 100%;
  font-size: 18px;
  //   border-bottom: solid 1px #e0e0e0;
  color: #fff;
  > .container {
    padding: 8px 0;
    .navbar-left {
      float: left;
      display: block;
    }
    .navbar-header {
      text-align: center;
      height: 48px;
      line-height: 48px;
      > .logo {
        margin-top: 8px;
        height: 30px;
        float: none;
      }
      > .menus {
        top: 100%;
        left: 0;
        right: 0;
        position: absolute;
        text-align: left;
        z-index: 1;
        > ul {
          margin: 0;
        }
        li {
          display: block;
        }
      }
    }
    .navbar-right {
      float: right;
    }
  }
  &.fixed {
	position: fixed;
	z-index: 1;
  }
  &.md {
    > .container {
      .navbar-left {
        display: none;
      }
      .navbar-header {
        > .logo {
          float: left;
        }
        > .menus {
          position: static;
          background: transparent;
          text-align: center;
          li {
            display: inline-block;
            margin: 0 10px;
            .hover-color(@cyan100);
          }
        }
      }
    }
  }
}
</style>
