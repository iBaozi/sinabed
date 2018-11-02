<template>
	<mu-container class="pages-history">
		<i-date-range v-if="this.user.token" ref="date" max="today" all type="">
			<mu-button @click="refresh" color="primary">搜索</mu-button>
		</i-date-range>
		<mu-load-more @refresh="refresh" :refreshing="refreshing" :loading="this.user.token&&loading" @load="loadmore">
			<mu-paper :z-depth="1">
				<div class="mu-grid-list">
					<div class="mu-sub-header">上传历史</div>
					<div v-for="(item,i) in list" :key="i" class="mu-grid-tile-wrapper">
						<div class="mu-grid-tile multiline"><img :src="item.url">
							<div class="mu-grid-tile-titlebar">
								<div class="mu-grid-tile-title-container">
									<div class="mu-grid-tile-title"><span>{{item.name}}</span></div>
									<div class="mu-grid-tile-subtitle"><span>
											<i-date :value="item.create_at"></i-date>上传
										</span></div>
								</div>
								<div class="mu-grid-tile-action">
									<mu-button @click="copy(item.url)" slot="action" icon>
										<mu-icon value="link"></mu-icon>
									</mu-button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- <mu-grid-list class="gridlist-demo">
					<mu-sub-header>上传历史</mu-sub-header>
					<mu-grid-tile v-for="(item,i) in list" :key="i">
						<img :src="item.url" />
						<span slot="title">{{item.name}}</span>
						<span slot="subTitle">上传于<i-date :value="item.create_at"></i-date></span>
						<mu-button slot="action" icon>
							<mu-icon value="star_border"></mu-icon>
						</mu-button>
					</mu-grid-tile>
				</mu-grid-list> -->
			</mu-paper>
		</mu-load-more>
	</mu-container>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class History extends Vue {
	@State(state => state.user.user) user;
	@State(state => state.history.list) history;
	list = []
	refreshing = false
	loading = false

	@utils.loading('refreshing')
	async refresh() {
		if (!this.user.token) return
		let { max, min } = this.$refs.date.getRange()
		let list = await this.$get('file/list', { token: this.user.token, create_max: max, create_min: min, offset: 0 })
		this.list = list
	}
	@utils.loading()
	async loadmore() {
		if (!this.user.token) return
		let { max, min } = this.$refs.date.getRange()
		let list = await this.$get('file/list', { token: this.user.token, create_max: max, create_min: min, offset: this.list.length })
		this.list = this.list.concat(list)
	}
	copy(str) {
		let ok = utils.copy(str)
		if (ok) this.$toast.success('复制成功')
		else this.$toast.error('复制失败')
	}
	mounted() {
		if (this.user.token) {
			this.refresh()
		} else {
			this.list = this.history
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-history {
  .mu-paper {
    overflow: hidden;
    margin: 1em 0;
  }
  .mu-grid-tile-wrapper {
    display: inline-block;
    height: 200px;
    margin: 5px;
    .mu-grid-tile {
      display: inline-block;
    }
  }
  .wrapper {
    position: relative;
    display: inline-block;
    margin: 5px;
    height: 200px;
    > img {
      height: 100%;
    }
    > .progress {
      .abs-full;
      text-align: center;
      line-height: 126px;
      font-size: 20px;

      background: rgba(255, 255, 255, 0.5)
        linear-gradient(
          right,
          rgba(255, 255, 255, 0.5),
          rgba(255, 255, 255, 0.5)
        )
        no-repeat;
    }
    > .mask {
      .abs-full;
      top: auto;
      min-height: 36px;
      color: #fff;
      background: rgba(0, 0, 0, 0.4);
      .mu-flat-button {
      }
    }
  }
}
</style>
