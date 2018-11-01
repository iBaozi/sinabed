<template>
	<div class="i-color" v-show="show" tabindex="1" @blur="blur">
		<div class="title" :style="{backgroundColor:color}">{{(title?title+'：':'')+(color||'')}}</div>
		<div v-for="(item,i) in colors" :key="i" :class="{c_dot:item.main}" :style="{backgroundColor:item.color}" @mouseover="mouseover(item)" @click="input(item)">　</div>
		<div style="width: 80px; box-shadow: none;">
			<div class="c_def" style="background-color: transparent;" @click="input({color:origin})">恢复默认</div>
		</div>
		<div class="c_btn c_btnA" :class="{disabled:S>0.99}" title="饱和度↑" @click="inc()">＋</div>
		<div class="c_btn c_btnD" :class="{disabled:S<0.01}" title="饱和度↓" @click="dec()">－</div>
	</div>
</template>
<script>
export default {
	name: "Color",
	props: {
		value: { type: String },
		show: { type: Boolean, default: false },
		origin: { type: String, default: 'transparent' }
	},
	data() {
		let main = {
			"#808080": "灰",
			"#ff0000": "红",
			"#ff8000": "橙",
			"#ffff00": "黄",
			"#80ff00": "黄绿",
			"#00ff00": "绿",
			"#00ff80": "水绿",
			"#00ffff": "浅蓝",
			"#0080ff": "湖蓝",
			"#0000ff": "蓝",
			"#8000ff": "雪青",
			"#ff00ff": "紫",
			"#ff0080": "嫣红",
		}
		return {
			main,
			brights: [14, 12, 8, 4, 0, -4, -8, -12], // 亮度调整
			S: 1,
			color: this.value,
			title: this.value ? main[this.value] + "色" : '',
		}
	},
	watch: {
		show() {
			if (this.show) {
				this.$nextTick(() => this.$el.focus())
			}
		}
	},
	computed: {
		colors() {
			let colors = []
			colors.push({ color: '#ffffff', title: '白色', main: true })
			for (let br of this.brights) {
				for (let color in this.main) {
					colors.push(this.convert(color, br, this.S))
				}
			}
			colors.push({ color: '#000000', title: '黑色', main: true })
			return colors
		},
	},
	methods: {
		inc() {
			if (this.S < 0.99)
				this.S += 0.2
		},
		dec() {
			if (this.S > 0.01)
				this.S -= 0.2
		},
		blur() {
			this.$emit('update:show', false)
		},
		mouseover(item) {
			this.color = item.color
			this.title = item.title
		},
		input(item) {
			this.$emit('input', item.color)
			this.$emit('update:show', false)
		},
		convert(color, br, S) {
			let title = ""
			let rgb = color
			if (typeof rgb === "string") rgb = [1, 3, 5].map(x => rgb.slice(x, x + 2)).map(x => parseInt(x, 16))
			if (0 == br && S > 0.9999) title = this.main[color] + "色";
			var c = ([rgb[0], rgb[1], rgb[2]]), k = br / 16;
			if (k < 0) k = -k;
			var c0 = (br > 0 ? 256 : 0);
			for (var i = 0; i < 3; i++)
				c[i] += parseInt((c0 - c[i]) * k)
			if (null != S && S >= 0 && S < 0.9999) {//此范围内才做纯度调整
				S = 1 - S;
				c0 = 0.31 * c[0] + 0.524 * c[1] + 0.166 * c[2];
				for (i = 0; i < 3; i++)
					c[i] = parseInt(c[i] + S * (c0 - c[i]));
			}
			let main = color == '#808080' || 0 == br
			color = '#' + ((c[0] << 16) | (c[1] << 8) | c[2] | 0x1000000).toString(16).substr(1);
			return { color, title, main }
		}
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-color {
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 0;
  width: 260px;
  background: #ece9d8;
  padding: 2px;
  border-radius: 0px 0px 4px 4px;
  box-shadow: 0px 0px 4px #000;
  font-size: 12px;
  line-height: 16px;
  box-sizing: content-box;
  > div {
    text-align: center;
    min-width: 16px;
    height: 16px;
    border-radius: 2px;
    float: left;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
    margin: 2px;
    cursor: pointer;
    &.title {
      color: rgb(255, 255, 255);
      text-shadow: rgb(0, 0, 0) 0px 0px 4px;
      width: 236px;
      border-radius: 12px 2px;
      box-shadow: rgba(0, 0, 0, 0.3) -1px -1px 1px;
      float: right;
    }
    .c_def {
      border-radius: 2px;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
      &:hover {
        color: #fff;
        text-shadow: -1px 0px 1px #000, 1px 0px 1px #000, 0px -1px 1px #000,
          0px 1px 1px #000;
      }
    }
    &.c_dot {
      border-radius: 8px;
    }
    &.c_btn {
      color: #404040;
      width: 20px;
      box-shadow: 0px 0px 3px #000;
      background: -webkit-linear-gradient(-90deg, #fff, #c0c0c0);
      &:hover {
        color: #ff0000;
        background: -webkit-linear-gradient(-90deg, #ffff80, #c0c000);
      }
      &.disabled {
        background: rgba(192, 192, 192, 0.4);
        color: rgba(0, 0, 0, 0.2);
        cursor: not-allowed;
      }
    }
    &.c_btnA {
      margin: 2px 1px 2px 18px;
      border-radius: 8px 0px 0px 8px;
    }
    &.c_btnD {
      margin: 2px 17px 2px 0px;
      border-radius: 0px 8px 8px 0px;
    }
  }
}
</style>
