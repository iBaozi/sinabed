<template>
	<ul v-if="isArr" class="i-tree-branch">
		<Branch v-for="(child,i) in data" :key="i" :idx="i" :data="child" :draggable="root.draggable"></Branch>
	</ul>
	<li v-else :class="{open}">
		<div @click="click($event)" class="i-tree-line" :class="cls" :draggable="root.draggable" @dragstart="drag" @dragover.prevent="drop" @dragleave="drop($event,1)" @drop="drop($event,2)">
			<mu-icon v-if="i_loading" value="refresh" class="loading"></mu-icon>
			<mu-icon v-else value="expand_less" class="i-tree-icon"></mu-icon>
			<node-content :node="data"></node-content>
		</div>
		<mu-expand-transition>
			<keep-alive>
				<Branch v-if="open&&hasChild" :data="data.children" :draggable="root.draggable"></Branch>
			</keep-alive>
		</mu-expand-transition>
	</li>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch, Inject, Provide } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../../common/utils';
const NodeContent = {
	props: {
		node: {
			required: true
		},
	},
	render(h) {
		const root = this.$parent.root;
		const node = this.node;
		return (
			root.$scopedSlots.default
				? root.$scopedSlots.default({ node })
				: <span class="i-tree-node-title">{node.title}</span>
		);
	}
}

@Component({ name: 'Branch', components: { NodeContent } })
export default class Branch extends Vue {
	@Inject('i-tree-root') root;
	@Inject('i-tree-value') value;
	@Inject({ from: 'i-tree-parent', default: null }) parent
	@Prop({ type: [Array, Object], required: true }) data
	@Prop({ type: Number }) idx;
	i_pos = 0
	i_loaded = false
	i_open = false
	i_dragenter = false
	i_loading = false
	@Provide('i-tree-parent')
	get self() {
		if (this.isArr) return this.parent
		return this.data
	}
	get isArr() {
		return this.data instanceof Array
	}
	get hasChild() {
		return this.data.children && this.data.children.length
	}
	get showIcon() {
		return this.hasChild || this.root.load && !this.i_loaded && !this.i_loading
	}
	get active() {
		return this.value && this.value.indexOf(this.data_id) >= 0
	}
	get cls() {
		let cls = {}
		if (this.i_dragenter) {
			cls.top = this.i_pos == 1
			cls.middle = this.i_pos == 2
			cls.bottom = this.i_pos == 3
		}
		cls.active = this.active
		cls.loading = this.loading
		cls.showIcon = this.showIcon
		return cls
	}
	get open() {
		if (this.data.open == null) return this.i_open
		return this.data.open
	}
	get data_id() {
		if (this.isArr) return 0
		return this.data.id
	}
	async click(e) {
		let clickIcon = e.target.tagName == 'I'
		if (!clickIcon) {
			this.root.$emit("click", this.data)
			this.$nextTick(this.toggleChecked)
			if (!this.root.contentToggle) return // 不允许点击内容展开
		}
		await this.toggle(clickIcon)
	}
	_toggle(force) {
		if (!force && this.i_open && this.value && !this.active) return
		this.i_open = !this.i_open
		this.root.$emit("toggle", this.data, this.i_open)
	}
	async toggle(force) {
		if (this.hasChild) {
			this._toggle(force)
		} else if (this.showIcon) {
			try {
				this.i_loading = true
				let nodes = await this.root.load(this.data)
				this.root.add(this.data, nodes)
				this.i_loaded = true
				this.i_loading = false
				if (this.showIcon) this._toggle(force)
			} catch (error) {
				this.i_loading = false
			}
		}
	}
	toggleChecked() {
		if (!this.value) return
		if (this.active) {
			if (this.root.multiple) this.value.splice(this.value.indexOf(this.data_id), 1)
			else this.value.splice(0, this.value.length)
		} else {
			if (this.root.multiple || !this.value.length) this.value.push(this.data_id)
			else this.value.splice(0, this.value.length, this.data_id)
		}
		this.root.$emit("change", this.value)
	}
	drag(e) {
		this.root.drag(this.data)
	}
	drop(e, step) {
		let percent = e.offsetY / e.target.offsetHeight
		let type
		if (this.root.dropMode) {
			if (percent < 0.3) {
				this.i_pos = 1
				type = 'top'
			} else if (percent <= 0.7) {
				this.i_pos = 2
				type = 'center'
			} else {
				this.i_pos = 3
				type = 'bottom'
			}
		} else {
			type = 'center'
			this.i_pos = 2
		}
		if (Boolean(step) == this.i_dragenter) this.i_dragenter = !step
		if (step == 2) {
			this.root.drop(type, this.parent, this.data, this.idx)
		}
	}
	mounted() {
		if (!this.isArr) {
			if (this.root.nMap[this.data_id]) console.error(`<i-tree>重复的data_id:${this.data_id}`);
			this.root.nMap[this.data_id] = this
		}
	}
	beforeDestroy() {
		if (!this.isArr) {
			delete this.root.nMap[this.data_id]
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-tree-branch {
  list-style-type: none;
  padding-left: 1.5em;
  .noselect;
  li.open > .i-tree-line > i {
    transform: rotate(180deg);
  }
  .i-tree-line {
    display: block;
    line-height: 1;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    padding: 0.3em;
    .magic-color(#fff, #fff - @bg-color);
    > i {
      transition: transform 300ms;
      float: left;
      margin-left: -1.2em;
      line-height: 0.7em;
      transform: rotate(90deg);
      &.material-icons {
        font-size: 1.5em;
      }
    }
    > .loading {
      color: rgba(0, 0, 0, 0.5);
      .loading;
    }
    > .i-tree-icon {
      color: transparent;
    }
    &.top {
      border-top-color: @primary;
    }
    &.middle {
      background-color: @primary;
    }
    &.bottom {
      border-bottom-color: @primary;
    }
    &.showIcon {
      > .i-tree-icon {
        color: @tip-color;
      }
    }
  }
  .i-tree-branch {
    padding-left: 1.125rem;
  }
}
</style>
