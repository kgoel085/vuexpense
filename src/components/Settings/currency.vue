<template>
  <v-layout>
	  <v-flex xs12>
			<loader v-if="currencyData.length == 0"></loader>

			<v-card v-if="currencyData.length > 0">
				<v-card-title>
					<v-layout row wrap>
						<v-flex class="grow">
							Select a base currency <strong><h2>{{ checkedCurrency }}</h2></strong>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-list>
						<v-list-tile>
							<v-text-field label="Search currency" v-model="searchTxt" @input="searchCurrency"></v-text-field>
						</v-list-tile>
						<v-radio-group v-model="checkedCurrency" class="pa-0 ma-0">
							<v-list-tile v-for="rate in currencyData" :key="rate.currency">
									<v-list-tile-content >
										<v-radio
											:label="`${rate.currency}  ( ${rate.name} -- ${rate.symbol} )`"
											:value="rate.currency"
										></v-radio>
									</v-list-tile-content>
							</v-list-tile>
						</v-radio-group>
					</v-list>
				</v-card-text>

				<v-card-actions>
					<v-layout>
						<v-flex xs12 class="text-xs-center">
							<v-slide-y-reverse-transition>
								<v-btn v-if="checkedCurrency" flat class="success mb-5" fixed absolute bottom @click="saveCurrency">Save</v-btn>
							</v-slide-y-reverse-transition>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
	  </v-flex>
  </v-layout>
</template>

<script>
import EventBus from '../../helpers/EventBus';
const loader = () => import('../Loader');

export default {
	data(){
		return {
			currencyData:[],
			checkedCurrency: null,
			searchTxt: null
		}
	},
	methods:{
		// Get latest currency exchange price details
		getCurrency(){
			const doc = this.$__firebase.firestore.collection('master').doc('data').collection('currency');
			const UserDoc = this.$__firebase.firestore.collection('settings').doc(this.$__firebase.fireauth.currentUser.uid).collection('currency').doc('data');

			// Get user settings document
			UserDoc.get().then(uData => {
				let currency = null;
				if(uData.exists){
					const data = uData.data();
					if(data && data.hasOwnProperty('currency')) currency = data.currency;
				}

				// Set current currency, if user has this value in database
				this.checkedCurrency = currency;

				// Get currency data from master document
				return doc.orderBy("currency", "asc").get();

			}).then(snapshot => {

				// Add currency data to interface
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						const data = doc.data();
						data.id= doc.id;

						this.currencyData.push(data);
					});
				}

			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
			});
		},

		// Search currency
		searchCurrency(){
			if(!this.searchTxt) return false;

			// Declare variables
			let input, filter, list, item, txtValue;

			input = this.searchTxt;
			filter = input.toString().toUpperCase();

			list = document.querySelectorAll('.v-input--radio-group__input div[role=listitem]');

			if(list){
				list.forEach(obj => {
					item = obj.querySelector('label.v-label');
					txtValue = item.textContent || item.innerText;

					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						obj.style.display = "";
					} else {
						obj.style.display = "none";
					}
				});
			}

		},

		// Save current currency
		saveCurrency(){
			const findCurrency = this.currencyData.find(obj => obj.currency === this.checkedCurrency);
			console.log(findCurrency);
			if(findCurrency) EventBus.$emit('SettingSaveData', 'currency', {...findCurrency});
		}
	},
	components:{
		loader
	},
	mounted(){
		this.getCurrency();
	}
}
</script>

<style>

</style>