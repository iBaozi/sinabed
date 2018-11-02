<template>
	<mu-container class="pages-home">
		<h1>上传图片</h1>
		<mu-checkbox label="识别图中二维码" v-model="query.qr"></mu-checkbox>
		<div class="dropbox">
			<div tabindex="0" @focus="focus=1" @blur="focus=0" @paste="paste" @dragover="onDragOver($event,1)" @dragleave="onDragOver($event,0)" @drop="drop" class="drop tac" :class="{dragover,focus}">
				<div v-if="!list.length" class="tip">Paste or Drag & drop files here …</div>
				<div v-for="(item,i) in list" :key="i" class="wrapper">
					<img :src="item.url" :alt="item.name">
					<div v-if="item.percent<100" class="progress" :style="{backgroundSize:'100%'+(100-item.percent)+'%'}">{{item.percent}}%</div>
					<div v-else-if="item.err" class="mask tar">
						<!-- <span style="color:#f44336">{{item.err}}</span> -->
						<mu-button flat color="error" @click="upload(item)">重传</mu-button>
					</div>
					<div v-else class="mask tar">
						<mu-button v-if="item.data" flat color="warning" @click="copy(item.data)">复制二维码</mu-button>
						<mu-button flat color="warning" @click="copy(item.url)">复制链接</mu-button>
					</div>
				</div>
			</div>
		</div>
		<div class="tar">
			<mu-button @click="onPick" color="grey900">选择图片</mu-button>
		</div>
		<mu-dialog title="验证码" :open.sync="pincode.open" :overlay-close="false">
			<mu-text-field label="验证码" v-model="pincode.value" v-focus>
				<img slot="append" :src="pin_url" alt="">
			</mu-text-field>
			<mu-button slot="actions" @click="onCode" color="primary">确定</mu-button>
		</mu-dialog>
	</mu-container>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';
import config from '../common/config';

@Component({ components: {} })
export default class Home extends Vue {
	@State(state => state.user.user) user;
	query = utils.query({ qr: null }, true)
	focus = 0
	dragover = 0
	list = []
	visibility = false
	pincode = {
		open: false,
		value: '',
		pin_at: 0,
	}

	get pin_url() {
		return config.api + `/api/file/code?username=${this.user.username || ''}&t=${this.pincode.pin_at}`
	}

	onDragOver(e, flag) {
		this.dragover = flag
		e.preventDefault()
	}
	onPick() {
		return utils.pick('image/*').then(file => this.upload(file))
	}
	@Action('addPhoto') addPhoto;
	async paste(e) {
		let files = e.clipboardData.files
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			await this.upload(file)
		}
	}
	async drop(e) {
		this.dragover = 0
		e.preventDefault()
		let files = e.dataTransfer.files
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			await this.upload(file)
		}
	}
	async upload(item) {
		if (item instanceof File) {
			let file = item
			item = {
				name: file.name,
				url: window.URL.createObjectURL(file),
				create_at: +new Date(),
				percent: 0,
				data: '',
				file: file,
				err: 0,
			}
			this.list.push(item)
			return await this.upload(item)
		}
		let formdata = new FormData()
		formdata.append('f', item.file)
		if (this.query.qr) formdata.append('qr', 1)
		for (let k in this.user) {
			let v = this.user[k]
			formdata.append(k, v)
		}
		try {
			let { data, url } = await this.$post('file/image', formdata, {
				onUploadProgress: e => {
					item.percent = (e.loaded / e.total * 100 | 0);
				}
			})
			item.url = url
			item.data = data
			item.err = 0
			this.addPhoto(item)
		} catch (err) {
			if ('需要输入验证码' == err) {
				this.pincode.open = true
				this.pincode.pin_at = +new Date()
			}
			item.err = err
		}
	}
	copy(str) {
		let ok = utils.copy(str)
		if (ok) this.$toast.success('复制成功')
		else this.$toast.error('复制失败')
	}
	async onCode() {
		if (this.pincode.value) {
			await this.$get('file/code', { username: this.user.username, code: this.pincode.value }, { loading: true })
			this.pincode.value = ''
			this.pincode.open = false
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-home {
  .dropbox {
    margin: 1em 0;
    border-radius: 5px;
    border: 1px solid #ddd;
    padding: 17px;
    .drop {
      border-radius: 4px;
      border: 2px dashed #aaa;
      text-align: center;
      &.dragover {
        background: #eee;
      }
      &.focus {
        border: 2px dashed #00b0ff;
      }
      > .tip {
        color: #aaa;
        font-size: 40px;
        padding: 85px 10px;
      }

      > .wrapper {
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
  }
}
</style>
