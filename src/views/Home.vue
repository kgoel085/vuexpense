<template>
	<v-container fluid>
		<v-layout row wrap>
			<!-- Fetch expense data for specific date -->
			<v-flex xs12 class="pa-1">
				<v-date-picker v-model="expenseDate" full-width class="mt-3"></v-date-picker>
			</v-flex>

			<v-flex xs12>
				<v-tabs v-model="currentTab" slider-color="secondary" fixed-tabs :key="expenseDate">
					<!-- Show data -->
					<v-tab key="showData" ripple>
						Expense Data
					</v-tab>

					<v-tab-item key="showData">
						<v-card flat>
							<v-layout row wrap>
								<!-- Add Data -->
								<expense :date="expenseDate"></expense>

								<!-- Show fetched data -->
								<v-flex xs12 v-if="userData && typeof userData == 'object' && userData.length > 0">
									{{ userData }}
								</v-flex>
								<v-flex xs12 v-else>
									<loader v-if="loadingData"></loader>
									<v-alert :value="true" type="info" v-else> No expense data found </v-alert>
								</v-flex>
							</v-layout>
						</v-card>
					</v-tab-item>
				</v-tabs>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
	import loader from '@/components/Loader'
	import expense from '@/components/User/Expense'
	export default {
		data(){
			return {
				// Stores the current expense data 
				userData: false,
				expenseDate: new Date().toISOString().substr(0, 10),
				loadingData: false,
				currentTab: 0,
				liveData: false
			}
		},
		watch:{
			// Reset everything if date is changed
			expenseDate(val){
				if(val){
					this.userData = false;
					this.getData();
				}
			}
		},
		components:{
			loader,
			expense
		},
		computed:{
			// Current user object
			userObj(){
				return this.$__firebase.fireauth.currentUser;
			},

			// User expense document
			expenseDoc(){

				// Return the document instance, if available
				if(this.userObj) return this.$__firebase.firestore.collection('expenses').doc(this.userObj.uid);

				return false;
			}
		},
		methods:{
			// Get the current date data
			getData(){
				let [year, month, date] = this.expenseDate.split('-');
				let expenseDoc = this.expenseDoc.collection('data').where('year', '==', year).where('month', '==', month).where('date', '==', date)
				expenseDoc.get().then(snapShot => {
					snapShot.forEach(doc => {
						if(doc.exists){
							let data = doc.data();
							data['id'] = doc.id;
							this.createData(data);
						}
					});
				});
			},

			// Creates the data for the interface
			createData(obj = false){
				if(obj){
					if(!this.userData) this.userData = [];
					this.userData.push(obj);
				}
			}
		},
		mounted(){
			this.getData();
		}
		
	}
</script>
