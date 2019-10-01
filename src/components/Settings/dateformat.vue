<template>
	<v-layout row wrap>
		<template v-if="loading">
			<loader></loader>
		</template>
		<template v-else>
			<v-flex xs12 v-for="(item, indx) in items" :key="indx">
				<v-select outline autofocus :items="item.items" item-text="text" item-value="value" :label="item.title" v-model="formFields[indx]"></v-select>
			</v-flex>
			<v-flex xs12 class="text-xs-center">
				<v-btn flat bottom fixed class="success" @click="saveFormat">Save</v-btn>
			</v-flex>
		</template>
	</v-layout>
</template>

<script>
import EventBus from '../../helpers/EventBus';
const loader = () => import('../Loader');

export default {
	data(){
		return {
			// Form Data
			formFields:{
				// Format
				dateFormat: null,
				firstMonth: null,
				firstDay: null
			},

			loading: false
		}
	},
	components: {
		loader
	},
	computed:{
		// Format settings master doc
		FormatDoc(){
			return this.$__firebase.firestore.collection('master').doc('data').collection('format');
		},

		// Format settings user doc
		UserFormatSettingDoc(){
			return this.$__firebase.firestore.collection('settings').doc(this.$__firebase.fireauth.currentUser.uid).collection('format').doc('data');
		},

		// Layout fields
		items(){
			let returnObj = {};

			// Add date formats
			const currentDate = new Date();
			let year = currentDate.getFullYear();
			let month = currentDate.getMonth();
			let date = currentDate.getDate();
			
			if(month <= 9) month = '0'+month;
			if(date <= 9) date = '0'+date;

			const dateObj = {y: year, M: month, d: date};

			const formats = ['y-M-d', 'M-d-y', 'd-M-y'];
			const separators = ['-', '/', '.'];

			const dateFormats = [];
			formats.forEach(obj => {
				let newDate = obj.split('-').map(f => {
					return dateObj[f];
				});

				separators.forEach(s => {
					const finalDt = newDate.join(s);
					dateFormats.push({text: ` ${obj.split('-').join(s)} ${finalDt}`, value: obj.split('-').join(s)})
				});
			});

			// Stores all the formats
			if(dateFormats.length > 0){
				returnObj.dateFormat = {
					items: dateFormats,
					title: 'Date format',
				}
			}

			// Add First days
			//const firstElems = ['Year', 'Month', 'Week'];
			const firstElems = ['Year', 'Month'];

			firstElems.forEach(obj => {
				let title = 'day', items
				let fieldValue = null;

				switch(obj){
					case 'Year':
						title = 'month';
						const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

						items = [];
						
						for(let i = 0; i < 12; i++){
							items.push({text: monthNames[i], value: i});
						}

						fieldValue = 'firstMonth';
					break;

					case 'Month':
						items = [];
						
						for(let i = 1; i <= 31; i++){
							items.push({text: i, value: i});
						}

						fieldValue = 'firstDay';
					break;

					case 'Week':
						items = [];
						const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
						
						for(let i = 0; i < 7; i++){
							items.push({text: days[i], value: i});
						}

						
					break;
				}

				if(fieldValue) returnObj[fieldValue] = {items, title: `First ${title} of ${obj}`};
			});

			return returnObj;
		}
	},
	methods:{
		// Get master / user saved data from DB
		getData(){
			this.loading = true;

			// First check for user saved data
			this.UserFormatSettingDoc.get().then(doc => {
				if(doc.exists){
					const data = doc.data();
					if(data && typeof data == 'object'){
						Object.keys(data).forEach(key => {
							if(this.formFields.hasOwnProperty(key)) this.formFields[key] = data[key];
						});
					}
				}

				return this.FormatDoc.get();
			}).then(masterData => {
				// Replace empty values with default values
				if(masterData || !masterData.empty){
					masterData.forEach(doc => {
						const data = doc.data();
						Object.keys(data).forEach(key => {
							if(this.formFields.hasOwnProperty(key) && !this.formFields[key]) this.formFields[key] = data[key];
						});
					});
					this.loading = false;
				}

				this.loading = false;
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
				this.loading = false;
			});
		},

		//Save data to DB
		saveFormat(){
			const data = {};

			Object.keys(this.formFields).forEach(obj => {
				const field = this.formFields[obj];
				data[obj] = field
			});

			if(data.dateFormat) data.separator = data.dateFormat.split('')[1];

			if(Object.keys(data).length > 0){
				EventBus.$emit('SettingSaveData', 'format', {...data});
			}
		}
	},
	mounted(){
		this.getData();
	}
}
</script>

<style>

</style>