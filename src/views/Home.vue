<template>
	<v-container fluid>
		<v-layout row wrap>
			<!-- Fetch expense data for specific date -->
			<v-flex xs12 md3 class="pa-1">
				<v-date-picker v-model="expenseDate" :reactive="true" full-width class="mt-3" :disabled="disableCalender"></v-date-picker>
				<!-- Add Data -->
				<expense :date="expenseDate" @disableFields="disableCalender = !disableCalender" :updateObj="rowUpdate" @resetUpdate="rowUpdate = {}"></expense>
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
								<!-- Show fetched data -->
								<v-slide-x-transition>
									<v-flex xs12 v-if="!loadingData && hasData">
										<div class="d-flex justify-between align-center mb-3">
											<v-btn @click="expandPanel = !expandPanel">{{ (expandPanel) ? 'Collapse' : 'Expand' }}</v-btn>
										</div>
										<v-expansion-panel v-model="panel" expand popout focusable :key="$store.state.global.updateView">
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
												<v-alert :value="true" type="info" v-if="type.data.length == 0" class="ma-2"> No expense data found </v-alert>
												<v-card v-else>
													<v-list-tile v-for="(data,indx) in type.data" :key="indx">
														<v-list-tile-content>
															<v-list-tile-title>
																{{ data.title }} 
															</v-list-tile-title>
														</v-list-tile-content>

														<v-list-tile-action>
															<span>{{ data.value }} <v-btn small icon class="pa-2 ma-2" @click="rowUpdate = data"><v-icon size="20" class="px-2">edit</v-icon></v-btn></span>
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
				expandPanel: false,

				// Calender is disabled or not
				disableCalender: false,

				// Stores the data of row to be updated
				rowUpdate:{}
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
			},

			// Check whether any data is there or not
			hasData(){
				if(this.userData.debit.data.length > 0 || this.userData.credit.data.length > 0) return true;
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

				// Reset update object
				this.rowUpdate = {};

				// Bind update method again
				this.updateData();
			},

			// Get the current date data
			getData(refresh = false){
				if(!this.expenseDoc) return false;
				if(refresh === true) this.resetData();

				// Get data
				this.expenseDoc.get().then(snapShot => {
					snapShot.forEach(doc => {
						if(doc.exists){
							// Extract data
							let data = doc.data();
							if(doc.id) data['id'] = doc.id;

							// Add data to interface
							this.createData(data);
						}
					});

					this.loadingData = false;
				});
			},

			// Check data for duplicate entries
			checkData(id = false){
				if(!id || !this.hasData) return false;

				let keys = Object.keys(this.userData);

				for(let key of keys){
					let obj = (this.userData.hasOwnProperty(key) && this.userData[key].data.length > 0) ? this.userData[key].data : false;
					if(obj){
						obj.forEach(elem => {});
					}
				}
				return false;
			},

			// Creates the data for the interface
			createData(obj = false){
				if(obj){
					// Check whether same document exists or not
					if(obj.hasOwnProperty('id') && obj.id) this.checkData(obj.id);

					// Check if current value type exists or not 
					if(obj.hasOwnProperty('type') && this.userData.hasOwnProperty(obj.type)){

						let mainObj = this.userData[obj.type];

						// Search whether same doc id already exist or not
						const found = mainObj.data.some(el => el.id == obj.id);

						if(obj.hasOwnProperty('value') && obj.value){
							// Collect all the value in their resp. collections
							if(!found){
								mainObj.total += parseInt(obj.value);
								mainObj.data.push(obj);
							}else{
								// Update the previous records
								Object.keys(obj).forEach(key => {
									if(mainObj.hasOwnProperty(key) && obj[key] != mainObj[key]) mainObj[key] = obj[key];
								})
							}
						}
					}
				}
			},
			
			// Listen for real time updates
			updateData(){
				if(!this.expenseDoc) return false;
				this.expenseDoc.onSnapshot(snapshot => {
					snapshot.forEach(doc => {
						// Extract data
						let data = doc.data();
						if(doc.id) data['id'] = doc.id;
						
						// Add data to interface
						this.createData(data);
					});
				}, function(err) {
					this.$store.commit('setSnackMsg', err.message)
				});
			}
		},
		mounted(){
			// Get actual data
			this.getData();

			// Listen for real time updates
			this.updateData();
		}
		
	}
</script>
