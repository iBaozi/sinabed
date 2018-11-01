<template>
	<!-- 左边有头像的列表 -->
	<div class="components-list-item" :style="`padding-left:${avatarWidth+padding*2}px;padding-right:${padding}px;`">
		<div class="list-item-avatar" :style="`margin-left:-${avatarWidth+padding}px;`">
			<slot name="avatar"></slot>
		</div>
		<slot></slot>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component()
export default class ListItem extends Vue {
	@Prop({ type: Number, default: 10 }) padding;
	@Prop({ type: Number }) width;
	avatarWidth = 50
	@Watch('width')
	refresh() {
		if (this.width)
			this.avatarWidth = this.width
		else {
			let item = this.$el.children[0]
			this.avatarWidth = item.offsetWidth
		}
	}
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.components-list-item {
  position: relative;
  padding: 15px;
  .list-item-avatar {
    float: left;
  }
}
</style>
