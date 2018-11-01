<template>
	<div class="i-editor">
		<div class="i-editor-tools">
			<slot></slot>
		</div>
		<render ref="render" :value="value" :disabled="disabled" @keydown="keydown" @keyup="keyup" @click="click" @blur="blur" @paste="paste" @drop="drop"></render>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch, Provide } from 'vue-property-decorator';
import { mapState, mapActions } from "vuex";
import Render from './render.js';

function exec(target, key, descriptor) {
	const method = descriptor.value;
	descriptor.value = function () {
		return this.execWith(method, arguments)
	};
	return descriptor;
}

@Component({
	components: {
		Render,
	}
})
export default class Editor extends Vue {
	@Prop({ type: Boolean, default: false }) disabled;
	@Prop({ default() { return []; } }) value;
	@Prop({
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
	}) toURL;
	@Provide('editor') get editor() {
		return this
	};
	height = 'auto';
	created() {
		this._currentRange = null;
		this.change_at = 0;
		this.activeHooks = []
	}
	keydown(e) {
		if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) { // Ctrl+S
			this.getData();
			e.returnvalue = false;
		}
	}
	keyup(e) {
		let node = this.getRange().commonAncestorContainer;
		if (e.keyCode == 13 && e.altKey) {
			let cmd;
			if (this.isEmpty()) {
				if (node.nodeType != 1 || node.childElementCount == 0) {
					cmd = node.nodeType == 1 ? node.innerText : node.data;
				}
				this.createRangeByElem(node);
			} else {
				cmd = this.getText();
			}
			this.$emit('cmd', cmd)
			return;
		}
		if (node.nodeType != 1 && node.parentNode == this.frame) {
			this.execCommand('formatBlock', `<P>`);
		}
		this.change_at = new Date().getTime();
		this.$emit('change');
		this.changeActive()
	}
	click() {
		this.changeActive()
	}
	blur() {
		this.saveRange();
	}
	paste(e) { // 粘贴图片、链接等
		if (e.clipboardData.items) {
			var items = e.clipboardData.items;
			for (var i = 0; i < items.length; ++i) {
				var item = items[i];
				if (item.kind == 'file') {
					var file = item.getAsFile();
					if (file) {
						if (item.type.indexOf('image/') >= 0) {
							this.toURL(file).then(url => this.insertImage(url));
						}
						e.preventDefault();
						return;
					}
				} else if (item.kind == "string" && item.type == "text/plain") {
					item.getAsString(r => {
						if (/^https?:\/\//.test(r)) {
							let image = new Image();
							image.src = r;
							image.onerror = () => {
								this.execCommand('undo');
								this.execCommand('createLink', r);
							};
							image.onload = () => {
								this.execCommand('undo');
								this.insertImage(r);
							};
						}
					});
				}
			}
		}
	}
	drop(e) {
		let files = e.dataTransfer.files;
		if (files.length > 0) {
			let pms = Promise.resolve();
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.type.indexOf('image/') >= 0) {
					pms = pms.then(_ => this.toURL(file).then(url => this.insertImage(url)));
				}
			}
			e.preventDefault();
			return;
		}
		this.change_at = new Date().getTime();
		this.$emit('change');
	}
	changeActive() {
		for (let fn of this.activeHooks) {
			fn()
		}
	}
	pushActive(fn) {
		if (typeof fn === "function") this.activeHooks.push(fn)
	}
	isFocus(node) {
		node = node || this.getContainerElem();
		let ok = false;
		while (node) {
			if (node == this.frame) {
				ok = true;
				break;
			}
			node = node.parentNode;
		}
		return ok
	}
	/**
	 * 带有预处理、收尾处理来执行函数
	 * @param {Function} method
	 * @param {Array} [args] 参数
	 */
	execWith(method, args) {
		if (!this.isFocus()) this.restoreRange();
		let final = () => {
			this.frame.focus();
			this.change_at = new Date().getTime();
			this.$emit('change');
			this.changeActive()
		}
		let ret = method.apply(this, args);
		if (ret && typeof ret.then === "function") {
			return ret.then(data => {
				final()
				return data;
			}, err => {
				final()
				return Promise.reject(err);
			});
		}
		final()
		return ret;
	}
	insertImage(url) {
		console.log(url)
		this.execCommand('insertImage', url)
	}
	@exec
	foreColor(value) {
		if (value) {
			document.execCommand('foreColor', null, value);
		} else {
			this.withRange(node => node.style.color = '');
		}
	}
	@exec
	fontName(value) {
		if (value) {
			document.execCommand('fontName', null, value);
		} else {
			this.withRange(node => node.style.fontFamily = value);
		}
	}
	@exec
	insertH(n, text) {
		n = +n || 5
		document.execCommand('insertHtml', null, `<h${n}>${this.toHtml(text)}</h${n}>`);
	}
	insertHr() {
		this.execCommand('insertHtml', `<hr>`)
	}
	@exec
	fontSize(value) {
		this.withRange(node => node.style.fontSize = value);
	}
	@exec
	createLink(r) {
		let node = this.getContainerElem();
		if (node && 'A' == node.tagName) { //原来就是个链接
			this.createRangeByElem(node);
			document.execCommand("unlink"); //删除链接
		} else if (this.isEmpty()) { //插入链接
			r = r || prompt("输入网址:");
			if (r) {
				document.execCommand("insertHTML", false, '<a href="' + r + '">' + this.toHtml(r) + '</a>');
				let node = this.getContainerElem();
				this.createRangeByElem(node, true);
			}
		} else { //变换为链接
			r = r || prompt("输入网址:", this.getText());
			if (r) {
				document.execCommand("createLink", false, r);
			}
		}
	}
	@exec
	blockQuote() {
		let range = this.getRange();
		let node = range.commonAncestorContainer;
		let blockquote = this.getNodeByTag(node, 'BLOCKQUOTE');
		if (blockquote) {
			this.createRangeByElem(blockquote);
			let html = blockquote.innerHTML;
			document.execCommand("outdent");
			document.execCommand("insertHtml", false, html);
		} else {
			this.expand(range);
			let html = this.getHtml(range);
			html = html.replace(/(<\/?)blockquote>/g, '$1p>');
			document.execCommand('insertHtml', false, `<blockquote>${html}</blockquote>`);
		}
	}
	@exec
	execCommand(name, value) {
		document.execCommand(name, null, value);
	}
	getData(nodes) {
		return this.$refs.render.getData()
	}
	// 获取 range 对象
	getRange(force) {
		const selection = window.getSelection();
		if (selection.rangeCount > 0)
			return selection.getRangeAt(0);
		if (force) {
			let range = document.createRange();
			selection.addRange(range);
			return range;
		}
	}

    /**
     * 保存选区
     * @param {Range} range 
     */
	saveRange(range) {
		this._currentRange = (range || this.getRange()).cloneRange();
	}

	// 恢复选区
	restoreRange() {
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(this._currentRange);
	}

    /**
     * 选中区域的文字
     * @param {Range} range 
     */
	getText(range) {
		range = range || this.getRange();
		if (range) {
			return range.toString();
		}
		return '';
	}

    /**
     * @param {Node} node 
     */
	getDeep(node) {
		let deep = 0;
		while (node.parentNode) {
			node = node.parentNode;
			deep++;
		}
		return deep;
	}

    /**
     * @param {Node} node 
     */
	deepParent(node, deep) {
		while (deep-- && node.parentNode) {
			node = node.parentNode;
		}
		return node;
	}

    /**
     * 选中区域的HTML, 扩选直到开始和结尾同层级
     * @param {Range} range 
     */
	getHtml(range) {
		range = range || this.getRange();
		if (range) {
			let html = [];
			let s = range.startContainer;
			let e = range.endContainer;
			let deep_s = this.getDeep(s);
			let deep_e = this.getDeep(e);
			let min = Math.min(deep_s, deep_e);
			s = this.deepParent(s, deep_s - min);
			e = this.deepParent(e, deep_e - min);
			while (s != e) {
				html.push(s.nodeType == 1 ? s.outerHTML : s.data);
				s = s.nextSibling;
			}
			html.push(e.nodeType == 1 ? e.outerHTML : e.data);
			return html.join('');
		}
		return '';
	}

	// 选区的 $Elem
	getContainerElem(range) {
		range = range || this.getRange();
		let elem;
		if (range) {
			elem = range.commonAncestorContainer;
			return elem.nodeType === 1 ? elem : elem.parentNode;
		}
	}
	getStartElem(range) {
		range = range || this.getRange();
		let elem;
		if (range) {
			elem = range.startContainer;
			return elem.nodeType === 1 ? elem : elem.parentNode;
		}
	}
	getEndElem(range) {
		range = range || this.getRange();
		let elem;
		if (range) {
			elem = range.endContainer;
			return elem.nodeType === 1 ? elem : elem.parentNode;
		}
	}

	// 选区是否为空
	isEmpty(range) {
		range = range || this.getRange();
		return range && range.startContainer && range.startContainer === range.endContainer && range.startOffset === range.endOffset;
	}

	isParent(p, c) {
		while (c) {
			if (c == p) return true;
			c = c.parentNode;
		}
	}

    /**
	 * 获取tagName为tag的祖先节点，用于判断祖先是否有BLOCKQUOTE
     * @param {Node} node 
     */
	getNodeByTag(node, tag) {
		while (node && node != this.frame) {
			if (tag == node.tagName)
				return node;
			node = node.parentNode;
		}
	}

    /**
	 * 找到节点在编辑器内最上层的祖先
     * @param {Node} node 
     */
	rootElem(node) {
		if (!node || node == this.frame) return node;
		while (node.parentNode != this.frame) {
			node = node.parentNode;
		}
		return node;
	}

    /**
     * 选中多个元素则拓展选区
     * @param {Range} range 
     */
	expand(range) {
		range = range || this.getRange();
		if (!range) return;
		let s = this.rootElem(range.startContainer);
		let e = this.rootElem(range.endContainer);
		if (s == e) return range.selectNodeContents(s);
		// range.setStartBefore(s);
		// range.setEndAfter(e);
		range.setStart(s, 0);
		range.setEnd(e, e.nodeType == 1 ? 1 : e.data.length);
		return range;
	}

    /**
     * 根据 elem 设置选区
     * @param {Node} elem
     * @param {boolean} [isContent] 是否只选中内容
     * @param {boolean} [toStart] 
     */
	createRangeByElem(elem, isContent, toStart) {
		if (!elem) return;

		const range = this.getRange(true);

		if (isContent) {
			range.selectNodeContents(elem);
		} else {
			range.selectNode(elem);
		}

		if (typeof toStart === 'boolean') {
			range.collapse(toStart);
		}

		return range;
	}
	/**
	 * 对选中区域做样式调整
	 */
	withRange(fn) {
		var node = node || this.getContainerElem();
		var props = [{
			key: 'color',
			cmds: ['foreColor', null, 'transparent'],
			value: 'transparent'
		}, {
			key: 'backgroundColor',
			cmds: ['backColor', null, 'transparent'],
			value: 'transparent'
		}, {
			key: 'fontFamily',
			cmds: ['fontName', null, 'sb'],
			value: 'sb'
		}, {
			key: 'fontSize',
			cmds: ['fontSize', null, 6],
			value: 'xx-large'
		}];
		var i, item, tmp;
		for (i = 0; i < props.length; i++) {
			item = props[i];
			tmp = node.style[item.key];
			if (tmp) break;
		}
		document.execCommand.apply(document, item.cmds);
		var node = this.getContainerElem();
		if (node) {
			fn(node);
			if (node.style[item.key] == item.value)
				node.style.backgroundColor = tmp || '';
		}
	}
	// 转换为html
	toHtml(text) {
		return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	resize() {
		this.frame.style.height = this.$el.offsetHeight - this.tools.offsetHeight + 'px'
	}
	mounted() {
		this.tools = this.$el.querySelector('.i-editor-tools')
		this.frame = this.$el.querySelector('.i-editor-content');
		this.resize()
		window.addEventListener('resize', this.resize)
		if (!this.frame._useStyleWithCSS) {
			document.execCommand('styleWithCSS', null, true);
			this.frame._useStyleWithCSS = true;
		}
		window.editor = this;
	}
	destroyed() {
		window.removeEventListener('resize', this.resize)
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-editor {
  color: #000;

  > .i-editor-tools {
    // border-bottom: 1px solid #ccc;
    line-height: 24px;
    user-select: none; // 菜单中一项

    > * {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 24px;
      color: #555;
      text-align: center;

      &:hover {
        // color: #000;
        box-shadow: inset 0px 0px 1px #000;
      }

      &.active {
        color: #1e88e5;
      }
    }

    // 按钮
    .btn {
      display: inline-block;
      width: 24px;
      height: 24px;

      &:hover {
        background-position-y: -22px;
        box-shadow: inset 0px 0px 4px #ff0000;
      }
    }

    // 组合菜单按键，如选择颜色
    .group .btn {
      width: 20px;

      &.icon-triangle {
        font-size: 12px;
        width: 11px;
        margin-left: -5px;
        position: relative;
        top: -2px;
        transform: rotate(180deg);
      }
    }

    // 弹出菜单
    .abs {
      position: absolute;
      z-index: 1;
      top: 100%;
      left: -115px;
      min-width: 250px;
      background: #fff;
      padding: 2px;
      border-radius: 0px 0px 4px 4px;
      box-shadow: 0px 0px 4px #000;
      text-align: left;

      > .item {
        &:hover {
          color: #fff;
          background-color: rgba(0, 0, 0, 0.5);
        }
      }
    }
  }

  > .i-editor-content {
    padding: 1em;
    border: 1px solid #ccc;

    a {
      text-decoration: none;
    }

    blockquote {
      padding: 20px;
      background-color: #f2f2f2;
      border-left: 6px solid #b3b3b3;
      word-break: break-word;
      font-size: 16px;
      font-weight: 400;
      line-height: 30px;
      margin: 0 0 20px;
    }

    * {
      margin-top: 0;
    }

    p {
      margin-bottom: 0;
    }
  }
}
</style>
