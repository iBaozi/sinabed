<template>
	<pull-to :style="{height}" :top-load-method="loadmore&&_loadmore" @top-state-change="topStateChange" :bottom-load-method="refresh&&_refresh" @bottom-state-change="bottomStateChange" :topConfig="topConfig" :bottomConfig="bottomConfig">
		<!-- vue 2.5 use slot-scope -->
		<template slot="top-block" slot-scope="props">
			<div class="load-wrapper">
				<i :class="topIconClass"></i>
				{{ props.stateText }}
			</div>
		</template>
		<slot></slot>
		<template slot="bottom-block" slot-scope="props">
			<div class="load-wrapper">
				<i :class="bottomIconClass"></i>
				{{ props.stateText }}
			</div>
		</template>
	</pull-to>
</template>

<style scoped lang="less">
.load-wrapper {
  line-height: 50px;
  text-align: center;
}
.icon-arrow {
  transition: 0.2s;
  transform: rotate(180deg);
}
.icon-loading {
  transform: rotate(0deg);
  animation-name: loading;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<script>
import PullTo from './PullTo';

export default {
	name: 'pull-more',
	props: ["refresh", "loadmore"],
	components: {
		PullTo
	},
	data() {
		return {
			topIconClass: '',
			bottomIconClass: '',
			height: '100%',
			topConfig: {
				pullText: '下拉加载',
				triggerText: '释放更新',
				loadingText: '加载中...',
				doneText: '加载完成',
				failText: '加载失败',
				loadedStayTime: 400,
				stayDistance: 50,
				triggerDistance: 70
			},
			bottomConfig: {
				pullText: '上拉刷新',
				triggerText: '释放更新',
				loadingText: '加载中...',
				doneText: '加载完成',
				failText: '加载失败',
				loadedStayTime: 400,
				stayDistance: 50,
				triggerDistance: 70
			}
		};
	},
	mounted() {
		this.height = window.innerHeight - this.$el.getBoundingClientRect().top + "px"
		console.log(this.height)
	},
	methods: {
		async _refresh(done) {
			try {
				await this.refresh()
				done('done')
			} catch (error) {
				console.log(error)
				done('fail')
			}
		},
		async _loadmore(done) {
			try {
				await this.loadmore()
				done('done')
			} catch (error) {
				console.log(error)
				done('fail')
			}
		},
		topStateChange(state) {
			var icon = {
				'icon-arrow': state === 'trigger',
				'icon-loading': state === 'loading'
			}
			if (state === 'pull' || state === 'trigger') {
				icon['ion-arrow-down-c'] = true
			} else if (state === 'loading') {
				icon['ion-load-a'] = true
			} else if (state === 'loaded-done') {
				icon['ion-checkmark'] = true
			}
			this.topIconClass = icon
		},
		bottomStateChange(state) {
			var icon = {
				'icon-arrow': state === 'trigger',
				'icon-loading': state === 'loading'
			}
			if (state === 'pull' || state === 'trigger') {
				icon['ion-arrow-down-c'] = true
			} else if (state === 'loading') {
				icon['ion-load-a'] = true
			} else if (state === 'loaded-done') {
				icon['ion-checkmark'] = true
			}
			this.bottomIconClass = icon
		}
	}
};
</script>