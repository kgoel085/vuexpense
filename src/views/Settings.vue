<template>
	<v-container>
		<v-layout row wrap>
			<v-flex xs12>
				<v-select solo autofocus cache-items :items="dropDownItems" return-object item-text="title" label="Select one" @input="triggerNav"></v-select>
			</v-flex>

			<v-flex xs12>
				<router-view></router-view>
			</v-flex>

		</v-layout>
	</v-container>
</template>

<script>
import EventBus from '../helpers/EventBus';

export default {
	data(){
		return {
			// Check whether any data is changed or not
			dataChanged: false
		}
	},
	computed:{
		// Settings drop-down
		dropDownItems(){
			// Get all child routes from router settings childs
			const routes = this.$router.options.routes.filter(route => route.name === 'settings');
			const {children: childRoutes} = routes[0]; 

			return childRoutes.map(obj => {
				const routeName = obj.name.split('.').pop().replace(/\b\w/g, l => l.toUpperCase());
				return {route: obj.name, title: routeName};
			})

			return [];
		}
	},
	methods:{
		// Load the selected settings
		triggerNav(obj = false){
			this.$router.push({name: obj.route});
		}
	},
	mounted(){
		//console.log(this.$router);
		EventBus.$on('Data_Changed', (stat = false) => {
			this.dataChanged = stat;
		});
	}
}
</script>

<style>

</style>