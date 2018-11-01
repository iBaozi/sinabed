<template>
	<div class="i-editor-menu_insertImage" v-click-outside="blur">
		<span class="btn i i-picture" title="图片" @click="focus"></span>
		<div class="abs" style="line-height:1.2;" v-show="show" tabindex="1">
			<ul class="tab-title">
				<li :class="{active:tab==0}" @click="tab=0">上传图片</li>
				<li :class="{active:tab==1}" @click="tab=1">网络图片</li>
			</ul>
			<div class="tab-content">
				<div class="upload" v-show="tab==0" @click="pick">
					<i class="i i-upload"></i>
				</div>
				<div class="insert" v-show="tab==1">
					<input v-model.lazy="url" type="text" placeholder="图片链接">
					<div>
						<button class="right" @click="insertImage">插入</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "InsertImage",
	inject: ['editor'],
	props: {
		toURL: {
			type: Function,
			default(file) {
				return new Promise((resolve, reject) => {
					var reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = function (e) {
						resolve(this.result);
					}
					reader.onerror = reject
				})
			}
		}
	},
	data() {
		return {
			show: false,
			tab: 0,
			url: '',
		}
	},
	computed: {
		disabled() {
			return !/^https?:\/\//.test(this.url)
		}
	},
	methods: {
		focus() {
			this.show = !this.show
			if (this.show) this.$nextTick(_ => this.abs.focus())
		},
		blur() {
			this.show = false
		},
		pick() {
			let input = document.createElement('input')
			input.type = 'file'
			input.multiple = true
			input.accept = 'image/jpg,image/jpeg,image/png,image/gif,image/bmp'
			input.onchange = e => {
				let pms = Promise.resolve()
				for (let i = 0; i < e.target.files.length; i++) {
					const file = e.target.files[i];
					pms = pms.then(_ => this.toURL(file).then(url => this.insertImage(url)))
				}
				this.show = false
			}
			input.click()
		},
		insertImage(url) {
			this.editor.insertImage(url || this.url)
			this.show = false
		}
	},
	mounted() {
		this.abs = this.$el.querySelector('.abs')
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-editor-menu_insertImage {
  > .abs {
    > .tab-title {
      list-style: none;
      font-size: 14px;
      margin: 2px 10px 0 10px;
      border-bottom: 1px solid #f1f1f1;
      overflow: hidden;
      > li {
        padding: 3px 5px;
        color: #999;
        cursor: pointer;
        margin: 0 3px;
        float: left;
        &.active {
          color: #333;
          border-bottom: 1px solid #333;
          cursor: default;
          font-weight: 700;
        }
      }
    }
    > .tab-content {
      padding: 10px 15px 10px 15px;
      font-size: 16px;
      &:hover {
        background-color: #fff;
      }
      > .upload {
        text-align: center;
        color: #999;
        cursor: pointer;
        line-height: 1;
        > .iconfont {
          font-size: 60px;
        }
      }
      > .insert {
        > input {
          display: block;
          width: 100%;
          margin: 10px 0;
          border: 0;
          border-bottom: 1px solid #ccc;
          &:focus {
            border-bottom: 2px solid #1e88e5;
          }
        }
        button {
          font-size: 14px;
          color: #1e88e5;
          border: none;
          padding: 5px 10px;
          background-color: #fff;
          cursor: pointer;
          border-radius: 3px;
          float: right;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
