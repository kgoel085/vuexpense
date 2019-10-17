<template>
	<v-container>
		<v-layout row wrap>
			<!-- Settings drop down -->
			<v-flex xs12>
				<v-select solo autofocus cache-items :items="dropDownItems" item-value="route" item-text="title" label="Select one" @input="triggerNav" v-model="currentRoute"></v-select>
			</v-flex>

			<v-flex xs12>
				<!-- Settings router view -->
				<router-view :key="currentRouteVal"></router-view>
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
			dataChanged: false,

			// Current route path
			currentRouteVal: null
		}
	},
	computed:{
		// Settings drop-down
		dropDownItems(){
			// Get all child routes from router settings childs
			const routes = this.$router.options.routes.find(obj => obj.path == '/settings');
			const {children: childRoutes} = routes; 

			// Filter out those options tht should not be shown as options
			return childRoutes.filter(obj => obj.showAsOption !== false).map(obj => {
				const routeName = obj.name.split('.').pop().replace(/\b\w/g, l => l.toUpperCase()).replace(/_/g, ' ');
				return {route: obj.name, title: routeName};
			})

			return [];
		},

		// Get current route
		currentRoute:{
			get(){
				return this.$route.name;
			},
			set(val){
				this.currentRouteVal = val;
			}
		},

		// Current user
		User(){
			return this.$__firebase.fireauth.currentUser;
		}
	},
	methods:{
		// Load the selected settings
		triggerNav(route = false){
			this.$router.push({name: route});
		},

		// Save settings data
		saveData(collection, newData = {}){
			const UserDoc = this.$__firebase.firestore.collection('settings').doc(this.User.uid).collection(collection).doc('data');
			if(!newData || typeof newData !== 'object'){
				this.$store.commit('setSnackMsg', 'Invalid data provided');
				return false;
			}

			const currentRouteName = this.currentRoute.split('.').pop().replace(/\b\w/g, l => l.toUpperCase());

			UserDoc.get().then(doc => {
				let userSettings = {};
				if(doc.exists){
					const data = doc.data();
					if(data) userSettings = {...data};
				}
				
				if(Object.keys(userSettings).length > 0 || Object.keys(newData).length > 0){
					const updateData = {...userSettings, ...newData};
					return UserDoc.set(updateData);
				}

				const err = new Error('No data found to update');
				return Promise.reject(err);
			}).then(result => {
				this.$store.dispatch('getUserSettings');
				EventBus.$emit('SettingsSaved', true);
				this.$store.commit('setSnackMsg', `${currentRouteName.replace('_', ' ')} updated successfully`);
				this.$router.push({name: 'settings'});
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
			})
		}
	},
	mounted(){
		EventBus.$on('Data_Changed', (stat = false) => {
			this.dataChanged = stat;
		});

		// Capture data save event
		EventBus.$on('SettingSaveData', (collection = '', stat = {}) => {
			this.saveData(collection, stat)
		})
	},
	beforeDestroy(){
		EventBus.$off(['Data_Changed', 'SettingSaveData']);
	}
}
</script>

<style>

</style>