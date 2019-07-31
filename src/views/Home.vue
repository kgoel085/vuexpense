<template>
	<v-container fluid>
		<v-layout row wrap>
			<!-- Fetch expense data for specific date -->
			<v-flex xs12 md3 class="pa-1">
				<v-date-picker v-model="expenseDate" full-width class="mt-3"></v-date-picker>
			</v-flex>

			<v-flex xs12 md9 class="pa-1">
				<v-tabs v-model="currentTab" slider-color="secondary" fixed-tabs :key="expenseDate">
					<!-- Show data -->
					<v-tab key="showData" ripple>
						Expense Data
					</v-tab>

					<v-tab-item key="showData">
						<v-card flat>
							<v-layout row wrap>
								<!-- Add Data -->
								<expense :date="expenseDate" @RecordUpdated="getData(true)"></expense>

								<!-- Show fetched data -->
								<v-slide-x-transition>
									<v-flex xs12 v-if="!loadingData && (userData.debit.data.length > 0 || userData.credit.data.length > 0)">
										<div class="d-flex justify-between align-center mb-3">
											<v-btn @click="expandPanel = !expandPanel">{{ (expandPanel) ? 'Collapse' : 'Expand' }}</v-btn>
										</div>
										<v-expansion-panel v-model="panel" expand popout focusable>
											<v-expansion-panel-content v-for="(type, indx) in userData" :key="indx">
												<template v-slot:header>
													<v-layout row wrap class="text-capitalize">
														<v-flex class="grow" :class="type.color+'--text'">
															<span>{{ indx }}</span>
														</v-flex>
														<v-flex class="shrink" :class="type.color+'--text'">
															<small>Total:</small>	  <strong>{{ type.total }}</strong>
														</v-flex>
													</v-layout>
												</template>
												<v-alert :value="true" type="info" v-if="type.data.length == 0"> No expense data found </v-alert>
												<v-card v-else>
													<v-list-tile v-for="(data,indx) in type.data" :key="indx">
														<v-list-tile-content>
															<v-list-tile-title>{{ data.title }}</v-list-tile-title>
														</v-list-tile-content>

														<v-list-tile-action>
															<span>{{ data.value }}</span>
														</v-list-tile-action>
													</v-list-tile>
												</v-card>
											</v-expansion-panel-content>
										</v-expansion-panel>
									</v-flex>
									<v-flex xs12 v-else>
										<loader v-if="loadingData"></loader>
										<v-alert :value="true" type="info" v-else> No expense data found </v-alert>
									</v-flex>
								</v-slide-x-transition>
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
				userData: {
					debit: {
						data: [],
						total: 0,
						color: 'red'
					},
					credit: {
						data: [],
						total: 0,
						color: 'success'
					}
				},

				// Annual calculations of expenses
				annualData:{
					yearly: {
						loading: true,
						data: []
					},
					monthly: {
						loading: true,
						data: []
					},
				},

				// Sets the current expense date to find
				expenseDate: new Date().toISOString().substr(0, 10),

				// A loader identifier
				loadingData: false,

				// Current tab selected
				currentTab: 0,

				// Current expansion panel
				panel: [],

				// make expansion panels extended / collapsed
				expandPanel: false
			}
		},
		watch:{
			// Reset everything if date is changed
			expenseDate(val){
				this.loadingData = true;
				if(val){
					// Reset main object
					this.resetData();

					// Get data for current selected date
					this.getData();
				}
			},

			// Manage the expand / collapse of divs
			expandPanel(val){
				// Expand all
				if(val) this.panel = [...Object.keys(this.userData)].map(_ => true)
				// Close all
				else this.panel = []; 
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
				if(this.userObj){
					// Date order
					let dtArr = ['year', 'month', 'date'];

					// Apply filter
					let expenseDoc = this.$__firebase.firestore.collection('expenses').doc(this.userObj.uid).collection('data');
					this.expenseDate.split('-').forEach((key, indx) => expenseDoc = expenseDoc.where(dtArr[indx], '==', parseInt(key)));

					return expenseDoc;
				}

				return false;
			}
		},
		methods:{
			// Reset the user data
			resetData(){
				// Reset main object
				Object.keys(this.userData).forEach(key => {
					let obj = this.userData[key];
					obj.data = [];
					obj.total = 0;
				});
			},

			// Get the current date data
			getData(refresh = false){
				if(refresh === true) this.resetData();

				// Get data
				this.expenseDoc.get().then(snapShot => {
					snapShot.forEach(doc => {
						if(doc.exists){
							let data = doc.data();
							data['id'] = doc.id;
							this.createData(data);
						}
					});

					this.loadingData = false;
				});
			},

			// Creates the data for the interface
			createData(obj = false){
				if(obj){
					// Check if current value type exists or not 
					if(obj.hasOwnProperty('type') && this.userData.hasOwnProperty(obj.type)){

						let mainObj = this.userData[obj.type];
						if(obj.hasOwnProperty('value') && obj.value){

							// Collect all the value in their resp. collections
							mainObj.total += parseInt(obj.value);
							mainObj.data.push(obj);
						}
					}
				}
			}
		},
		mounted(){
			this.getData();
		}
		
	}
</script>
