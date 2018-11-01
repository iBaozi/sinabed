<template>
	<mu-appbar class="app-title" color="primary">
		<mu-button v-if="!md" @click="toggleDrawer" icon slot="left">
			<mu-icon value="menu"></mu-icon>
		</mu-button>
		<router-link to="/" tag="span" class="btn">sl图床</router-link>
		<mu-menu slot="right">
			<mu-button flat>更多</mu-button>
			<mu-list slot="content">
				<mu-list-item @click="logout" button>
					<mu-list-item-content>
						<mu-list-item-title>注销</mu-list-item-title>
					</mu-list-item-content>
				</mu-list-item>
			</mu-list>
		</mu-menu>
	</mu-appbar>
</template>
<script>
import { mapState, mapActions } from "vuex";

export default {
	name: "AppNav",
	props: ["md"],
	data() {
		return {

		}
	},
	computed: {

	},
	methods: {
		...mapActions(['toggleDrawer', 'logout']),
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-app-nav {
}
</style>
