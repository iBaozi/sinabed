<template>
	<div class="i-editor-menu_split">
		<span class="i i-vertical"></span>
	</div>
</template>
<script>
export default {
	name: "Split"
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.i-editor-menu_split {
  margin: 0 -3px;
  cursor: default !important;
  &:hover {
    box-shadow: none !important;
  }
}
</style>