<template>
	<div class="i-tip">
		<slot></slot>
		<div class="x-array"></div>
	</div>
</template>
<script>
export default {
	name: "ITip",
	props: {
		show: { type: Boolean }
	},
	data() {
		return {

		}
	},
	computed: {
	},
	watch: {
		show() {
			this.toggle(this.show)
		}
	},
	methods: {
		toggle(show) {
			let rect = this.$el.parentElement.getBoundingClientRect()
			if (rect.top > window.innerHeight / 2) {
				this.$el.style.top = ''
				this.$el.style.bottom = rect.height + 16 + 'px'
			} else {
				this.$el.style.top = rect.height + 16 + 'px'
				this.$el.style.bottom = '';
			}
			// this.$el.style.display = 'block'
		}
	},
	components: {

	},
	mounted() {
		// var parent = this.$el.parentElement
		// document.body.addEventListener('click', e => {
		// 	if (this.$utils.hasParent(e.target, this.$el)) {
		// 		this.$el.style.display = 'none'
		// 	} else if (this.$utils.hasParent(e.target, parent)) {
		// 		this.show()
		// 	} else {
		// 		this.$el.style.display = 'none'
		// 	}
		// })
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-tip {
  position: absolute;
  left: 0;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  z-index: 1;
  .x-array {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
  }
}
</style>
