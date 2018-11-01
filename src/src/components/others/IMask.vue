<template>
	<transition :name="animate">
		<div v-show="show" class="others-i-mask" :style="maskStyle" @click="click">
			<div class="content" :style="contentStyle">
				<div v-if="title" class="header-bg"></div>
				<div v-if="title" class="header">
					<div class="title">{{title}}</div>
				</div>
				<slot></slot>
			</div>
		</div>
	</transition>
</template>
<script>

export default {
	name: "IMask",
	props: {
		show: {},
		height: { type: Number },
		title: { type: String },
		maskColor: { type: String, default: 'rgba(0,0,0,.5)' },
		backColor: { type: String },
		animate: { type: String }
	},
	data() {
		return {
			h: 0
		}
	},
	computed: {
		top() {
			let height = (this.height || this.h)
			return (window.innerHeight - height) / 3
		},
		maskStyle() {
			return {
				backgroundColor: this.maskColor,
			}
		},
		contentStyle() {
			return {
				backgroundColor: this.backColor,
				top: `${this.top}px`,
			}
		}
	},
	methods: {
		click(e) {
			console.log(e)
			if (e.target == this.$el) {
				this.$emit('close')
				this.$emit('update:show', false)
			}
		}
	},
	components: {

	},
	mounted() {
		let content = this.$el.children[0]
		let dom = content.children[content.children.length - 1]
		this.h = dom.clientHeight
		this.w = dom.clientWidth
		if (this._height < 1) {
			var div = document.getElementById('i-mask-ruler')
			if (!div) {
				div = document.createElement('div')
				div.style.visibility = false
				div.style.position = 'absolute'
				div.style.left = '-10000px'
				document.body.appendChild(div)
			}
			div.innerHTML = dom.outerHTML
			this.h = div.offsetHeight
			this.w = div.clientWidth
			div.innerHTML = ''
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.others-i-mask {
  .fixed-full;
  text-align: center;
  transition: all 0.5s;
  > .content {
    position: relative;
    display: inline-block;
    padding: 3em 2em 2em;
    background-color: #fff;
    > .header-bg {
      position: absolute;
      z-index: 0;
      background: #409eff - #222;
      top: 0;
      left: 0;
      height: 2.5rem;
      width: 2rem;
      margin: 0 auto;
      transform: perspective(5rem) rotateY(135deg);
      transform-origin: center left;
    }
    > .header {
      position: absolute;
      z-index: 2;
      top: 0.3em;
      left: -1.1em;
      margin: 0 auto;
      text-align: left;
      font-size: 1.1rem;
      padding: 0 0.5em;
      height: 1.8rem;
      line-height: 1.8rem;
      background: #409eff;
      color: #fff;
      cursor: default;
      box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
