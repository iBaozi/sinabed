<template>
	<mu-drawer :open="md||show" @update:open="toggleDrawer" :docked="md">
		<!-- 个人信息 -->
		<mu-card style="width: 100%; max-width: 375px; margin: 0 auto;">
			<mu-card-header v-if="user" :title="user.name" :sub-title="user.money+' SB'">
				<mu-avatar slot="avatar">
					<router-link to="/user_edit">
						<img :src="user.avatar" :alt="user.id">
					</router-link>
				</mu-avatar>
			</mu-card-header>
			<mu-button v-else flat style="width: 100%;">登录</mu-button>
		</mu-card>
		<mu-divider></mu-divider>
		<mu-list>
			<mu-list-item v-for="route in routes" :key="route.name" :to="route.path" button>
				<mu-list-item-action v-if="route.icon">
					<i :class="'i i-'+route.icon" style="font-size:24px;"></i>
				</mu-list-item-action>
				<mu-list-item-title>{{route.name}}</mu-list-item-title>
			</mu-list-item>
		</mu-list>
	</mu-drawer>
</template>
<script>
import { mapState, mapActions } from "vuex";
import routes from '../router/routes.js';

export default {
	name: "AppDrawer",
	props: ['md'],
	data() {
		return {
			routes: routes.filter(x => x.menu).map(({ name, path, icon }) => ({ name, icon, path: path.split('/').slice(0, 2).join('/') })),
		}
	},
	computed: {
		...mapState({
			loading: state => state.app.loading,
			show: state => state.app.show,
			user: state => state.user.user,
		})
	},
	methods: {
		...mapActions(['toggleDrawer']),
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-app-drawer {
}
</style>
