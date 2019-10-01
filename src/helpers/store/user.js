import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import store from '@/store';
import router from '@/router';

const user = {
	state: {
		// User saved settings
		savedSettings: {}

	},

	getters: {
		'UserSavedSettings': state => state.savedSettings,
	},

	mutations: {
		// Set the user settings
		setUserSettings(state, dataObj = {}){
			const {collection, data} = dataObj;
			if(collection) state.savedSettings[collection] = data;
		}
	},

	actions: {
		// Get user saved settings
		getUserSettings({commit}){
			const SettingRoute = router.options.routes.find(obj => obj.name == 'settings');
			const user = firebase.auth().currentUser;

			if(SettingRoute){
				const DbCollections = SettingRoute.children.map(obj => {
					return obj.name.split('.').pop()
				});

				if(DbCollections && typeof DbCollections == 'object' && DbCollections.length > 0){
					
					DbCollections.forEach(collection => {
						const UserSettingsDoc = firebase.firestore().collection('settings').doc(user.uid).collection(collection);
						UserSettingsDoc.get().then(snapShot => {
							if(!snapShot.empty){
								let tmpObj = [];
								snapShot.forEach(doc => {
									if(doc.exists){
										const data = doc.data();
										data.id = doc.id;

										tmpObj.push(data);
									}
								});
								
								commit('setUserSettings', {collection, data: tmpObj});
							}

							return false;
						}).catch(err => {
							store.commit('setSnackMsg', err.message);
						})
					});
					
				}
			}
		}
	}
};

export default user;