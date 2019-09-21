<template>
  <v-layout>
	  <v-flex xs12>
			<loader v-if="currencyData.length == 0"></loader>

			<v-card v-if="currencyData.length > 0">
				<v-card-title>
					<v-layout row wrap>
						<v-flex class="grow">
							Select a base currency
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-list>
						<v-list-item >
							<v-text-field label="Search">

							</v-text-field>
						</v-list-item>
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
								<v-btn v-if="checkedCurrency" flat class="success mb-5" fixed absolute bottom>Save</v-btn>
							</v-slide-y-reverse-transition>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
	  </v-flex>
  </v-layout>
</template>

<script>
const loader = () => import('../Loader');

export default {
	data(){
		return {
			currencyData:[],
			checkedCurrency: null
		}
	},
	methods:{
		// Get latest currency exchange price details
		getCurrency(){
			const doc = this.$__firebase.firestore.collection('master').doc('data').collection('currency');
			doc.orderBy("currency", "asc").get().then(snapshot => {
				//console.log(snapshot);
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						const data = doc.data();
						data.id= doc.id;

						this.currencyData.push(data);
					});
				}
			})
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