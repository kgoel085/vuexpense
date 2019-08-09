<template>
	<v-container fluid>
		<v-layout row wrap>
			<v-flex xs12 md3 class="pa-1">
				<!-- Handle current date related operations like add/update/delete operations for current data -->
				<Leftbar></Leftbar>
			</v-flex>
			<v-flex xs12 md9 class="pa-1">
				<!-- View user data -->
				<MainContent></MainContent>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
// Modules
import EventBus from '../helpers/EventBus';

// Components
const Leftbar = () => import('@/components/Home/LeftBar');
const MainContent = () => import('@/components/Home/MainContent');

export default {
	data(){
		return {

		}
	},
	components:{
		Leftbar,
		MainContent
	},
	mounted(){
		// Set vuex variables
		EventBus.$on('date-changed', date => this.$store.commit('setHomeDate', date));
		EventBus.$on('set-tab', tab => this.$store.commit('setHomeTab', tab));
		EventBus.$on('set-tab-data', data => this.$store.commit('setHomeTabData', data));
		EventBus.$on('disable-element', state => this.$store.commit('disableElements', state));
	},
	beforeDestroy(){
		EventBus.$off(['date-changed', 'set-tab', 'set-tab-data', 'disable-element']);
	}
}
</script>

<style>

</style>
