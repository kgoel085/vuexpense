<template>
	<v-container fluid>
		<v-flex xs12>
			<v-tabs v-model="currentTab" flat fixed centered>
				<v-tab v-for="child in childRoutes" :key="child.name" @click="$router.push({path: child.path})">
					{{child.name | uppercase}}
				</v-tab>
			</v-tabs>
		</v-flex>
		<v-flex xs12>
			<!-- Current tab component -->
			<!-- <component :is="CurrentComponent" :key="currentTab"></component> -->
			<router-view :key="currentTab"></router-view>
		</v-flex>
	</v-container>
</template>

<script>
export default {
	data(){
		return{
			currentTab: 0
		}
	},
	computed:{
		// Get current Route details 
		childRoutes(){
			const currentRoute = this.$router.options.routes.find(obj => obj.name === 'home');
			if(currentRoute){
				const childRoutes = currentRoute.children.map(obj => {
					return {name: obj.name.split('.').pop(), path: obj.path};
				});

				if(childRoutes && Object.keys(childRoutes).length > 0) return childRoutes;
			}

			return {};
		}
	},
	mounted(){
		// Check for current route
		if(this.childRoutes && this.childRoutes[this.currentTab]){
			this.$router.push({path: this.childRoutes[this.currentTab].path});
		}
	}
}
</script>

<style>

</style>