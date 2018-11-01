<template>
	<ul v-if="isArr" class="i-tree">
		<tree v-for="(child,i) in data" :key="i" :data="child" :i-root="root" :load="load" :highlight-current="highlightCurrent" :draggable="draggable"></tree>
	</ul>
	<li :class="{open}" v-else>
		<div @click="click($event)" class="i-tree-line" :class="cls" :draggable="draggable" v-drag-data="data_id" v-drop="drop">
			<mu-icon v-if="i_loading" value="refresh" class="loading"></mu-icon>
			<mu-icon v-else value="expand_less" class="i-tree-icon"></mu-icon>
			<node-content :node="data"></node-content>
		</div>
		<mu-expand-transition>
			<keep-alive>
				<tree v-if="open&&hasChild" :data="data.children" :i-root="root" :load="load" :highlight-current="highlightCurrent" :draggable="draggable"></tree>
			</keep-alive>
		</mu-expand-transition>
	</li>
</template>
<script>
export default {
	name: "tree",
	model: {
		prop: 'value',
		event: 'change'
	},
	props: {
		data: {
			type: [Object, Array],
			required: true,
		},
		value: { type: Array, default() { return [] } },
		highlightCurrent: Boolean,
		load: Function,
		draggable: Boolean,
		iRoot: {},
	},
	data() {
		let data = {}
		if (!this.iRoot) data.i_active = ''
		if (!this.isArr) {
			data.i_pos = 0
			data.i_loaded = false
			data.i_open = false
			data.i_dragenter = false
			data.i_loading = false
		}
		return data
	},
	computed: {
		isArr() {
			return this.data instanceof Array
		},
		hasChild() {
			return this.data.children && this.data.children.length
		},
		showIcon() {
			return this.hasChild || this.load && !this.i_loaded && !this.i_loading
		},
		self() {
			return this
		},
		root() {
			return this.iRoot || this
		},
		active() {
			return this.root.value.indexOf(this.data_id) >= 0
		},
		cls() {
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
		},
		open() {
			if (this.data.open == null) return this.i_open
			return this.data.open
		},
		data_id() {
			if (this.data.id) {
				if (this.root.inc <= this.data.id) this.root.inc = this.data.id + 1
				return this.data.id
			}
			this.data.id = this.root.inc = this.root.inc || 1
			return this.root.inc++
		}
	},
	methods: {
		async click(e) {
			this.root.$emit("click", this.data, this.path)
			if(ok) 
			if (this.hasChild) {
				this.toggle()
			} else if (this.showIcon) {
				try {
					this.i_loading = true
					await this.load(this.data, this.path)
					this.i_loaded = true
					this.i_loading = false
					if (this.showIcon) this.toggle()
				} catch (error) {
					this.i_loading = false
				}
			}
		},
		toggle() {
			if (this.i_open && !this.active) return
			this.i_open = !this.i_open
			let data = this.data
			let path = this.path
			let open = this.i_open
			this.root.$emit("toggle", { data, path, open })
		},
		drop(e, data, done) {
			let percent = e.offsetY / e.target.offsetHeight
			if (percent < 0.2) {
				this.i_pos = 1
			} else if (percent < 0.8) {
				this.i_pos = 2
			} else {
				this.i_pos = 3
			}
			this.root.$emit("drop", { event: e, from: data, to: this.data })
		},
		setCurrentPath(path) {
			this.i_active = path instanceof Array ? path.join(",") : path
			return console.log(this)
			let children = this.root.$children
			for (let i of path) {
				if (!children || !children[i]) return
				children[i].i_open = true
				children = children[i].$children
			}
		},
		getNodeByPath(path) {
			console.log(this)
		}
	},
	components: {
		NodeContent: {
			props: {
				node: {
					required: true
				},
				path: {
					type: Array,
					required: true
				},
			},
			render(h) {
				const root = this.$parent.root;
				const node = this.node;
				const path = this.path;
				return (
					root.$scopedSlots.default
						? root.$scopedSlots.default({ node, path })
						: <span class="i-tree-node-title">{node.title}</span>
				);
			}
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";

.i-tree {
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
  .i-tree {
    padding-left: 1.125rem;
  }
}
</style>
