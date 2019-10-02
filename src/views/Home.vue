<template>
	<v-container fluid>
		<v-flex xs12>
			<v-tabs v-model="currentTab" flat fixed centered>
				<v-tab v-for="tab in tabs" :key="tab.name">
					{{tab.name}}
				</v-tab>
			</v-tabs>
		</v-flex>
		<v-flex xs12>
			<!-- Current tab component -->
			<component :is="CurrentComponent" :key="currentTab"></component>
		</v-flex>
	</v-container>
</template>

<script>
const SummaryView = () => import('../components/Home/Summary'); 

export default {
	data(){
		return{
			currentTab: 0,
			tabs:[
				{name: 'Summary', component: 'SummaryView'}
			],
			
		}
	},
	components:{
		SummaryView
	},
	computed:{
		// Current Component
		CurrentComponent(){
			return this.tabs[this.currentTab].component;
		}
	}
}
</script>

<style>

</style>