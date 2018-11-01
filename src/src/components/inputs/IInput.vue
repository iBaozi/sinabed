<template>
	<div class="i-input" :class="_cls">
		<span class="title">{{title}}</span>
		<div>
			<input :value="value" v-on="_listeners" :type="_type" @click="show" v-blur="hide">
			<collapse :duration="0.2">
				<i-tip v-if="_show_tip">
					<ul>
						<li v-for="(item,i) in _options" :key="item.label" :class="{active:item.value==value,hover:i==cur_opt}" @mousemove="cur_opt=i" @click="click(i)">{{item.label}}</li>
					</ul>
				</i-tip>
			</collapse>
		</div>
	</div>
</template>
<script>

export default {
	name: "IInput",
	props: {
		title: String,
		type: { type: String, default: 'text' },
		value: {},
		options: { type: Array },
		inline: { type: Boolean }
	},
	data() {
		return {
			show_tip: false,
			cur_opt: -1,
		}
	},
	computed: {
		_cls() {
			return {
				inline: this.inline,
			}
		},
		_show_tip() {
			return this._options && this.show_tip
		},
		_type() {
			return this.type
		},
		_listeners: function () {
			return Object.assign({}, this.$listeners, {
				input: event => {
					this.$emit('input', event.target.value)
				},
				keyup: event => {
					if (event.keyCode == 38) {
						if (this.cur_opt > 0) this.cur_opt--
						event.preventDefault()
					} else if (event.keyCode == 40) {
						if (this.cur_opt < this._options.length - 1) this.cur_opt++
						event.preventDefault()
					} else if (event.keyCode == 13 && this.options) {
						let opt = this._options[this.cur_opt]
						if (this.show_tip) {
							if (opt) this.$emit('input', opt.value)
							this.hide()
						} else {
							this.show()
							return
						}
						event.preventDefault()
					}
					if (this.$listeners.keyup) this.$listeners.keyup(event)
				}
			})
		},
		_options() {
			if (!this.options) return null
			return this.options.map(x => {
				if (typeof x === "string") return { label: x, value: x }
				return x
			})
		},
		_li_class() {
			return
		}
	},
	methods: {
		show() {
			for (let i = 0; i < this.options.length; i++) {
				let opt = this.options[i];
				if (opt.value == this.value) {
					this.cur_opt = i
					break
				}
			}
			this.show_tip = true
		},
		hide() {
			this.show_tip = false
		},
		click(i) {
			this.cur_opt = i
			let opt = this._options[this.cur_opt]
			if (opt) this.$emit('input', opt.value)
			this.hide()
		},
	},
	components: {
	},
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-input {
  //   > .title {
  //     display: inline-block;
  //     transform: translateY(0.4em);
  //   }
  line-height: 2;
  > div {
    display: inline-block;
    position: relative;
    > input {
      border: 0;
      border-bottom: 1px solid #dcdfe6;
      outline: none;
      font-size: 1em;
      padding: 0 0.5em;
      line-height: 1.5;
    }
  }
  .i-tip {
    > ul {
      list-style: none;
      margin: 0;
      > li {
        color: #606266;
        padding: 0 1em;
        line-height: 2.1;
        &.active {
          color: #409eff;
          font-weight: 700;
        }
        &.hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
}
</style>
