<template>
	<v-container fluid>
		<v-layout row wrap>
			<!-- Fetch expense data for specific date -->
			<v-flex xs12 md3 class="pa-1">
				<v-menu
					ref="menu"
					v-model="menu"
					:close-on-content-click="false"
					:nudge-right="40"
					lazy
					transition="scale-transition"
					offset-y
					full-width
					min-width="290px"
				>
					<template v-slot:activator="{ on }">
						<v-text-field
							v-model="expenseDate"
							label="Picker in menu"
							prepend-icon="event"
							readonly
							v-on="on"
							@click:append-outer="showPicker = !showPicker"
						>
							<!-- Tooltip for appended icon -->
							<template v-slot:append-outer>
								<v-tooltip bottom>
									<template v-slot:activator="{ on }">
										<v-icon v-on="on" @click="showPicker = !showPicker">{{ (showPicker) ? 'expand_less' : 'expand_more'  }}</v-icon>
									</template>
									See data overview
								</v-tooltip>
							</template>
						
						</v-text-field>
					</template>
					<v-date-picker v-model="expenseDate" :disabled="disableCalender" scrollable></v-date-picker>
				</v-menu>

				<!-- Show big picker if selected by user -->
				<v-slide-y-transition>
					<v-date-picker width="100%" :reactive="true" v-model="expenseDate" v-if="showPicker" :disabled="disableCalender" :events="dataPointArr"></v-date-picker>
				</v-slide-y-transition>

				<!-- Add / Update Data -->
				<component v-if="parentComponent" :is="parentComponent.parent" :date="expenseDate" @disableFields="disableCalender = !disableCalender" :updateObj="rowUpdate" @resetUpdate="rowUpdate = {}" :saveDoc="parentComponent.doc" :excludeFields="parentComponent.excludeFields" :key="currentTab"></component>
			</v-flex>

			<v-flex xs12 md9 class="pa-1">
				<v-tabs v-model="currentTab" slider-color="secondary" fixed-tabs :key="expenseDate">
					<!-- Show data -->
					<v-tab v-for="tab in tabNav" :key="tab.title" ripple>
						{{ tab.title }}
					</v-tab>

					<v-tab-item v-for="tab in tabNav" :key="tab.component">
						<component :is="tab.component" :expenseDate="expenseDate" :disableElem="disableCalender" :updateView="updateView" @update-row="updateData" @confirm-delete="confirmDelete(...arguments)"></component>
					</v-tab-item>
				</v-tabs>
			</v-flex>
		</v-layout>


		<!-- Confirmation dialog ( Delete / Restore ) -->
        <v-dialog
            v-model="dialog.show"
            persistent
            width="50%"
        >
            <v-card color="primary" dark v-if="dialog.loading || !dialog.data">
                <v-card-text>
                    Please stand by
                    <v-progress-linear indeterminate color="white" class="mb-0" ></v-progress-linear>
                </v-card-text>
            </v-card>
            <v-card v-else class="grow">
                <v-card-title class="text-xs-center">
                    <v-flex xs12>
                        <span class="headline">Are you sure to {{ (dialog.restore ? 'restore' : 'delete') }} selected record ?</span>
                    </v-flex>
                </v-card-title>

                <v-card-actions>
                    <v-flex xs12  class="text-xs-center">
                        <v-btn flat :small="$vuetify.breakpoint.smAndDown" class="primary error ma-1" @click="deleteRecord(dialog.data.id, dialog.restore)">
                            Confirm
                        </v-btn>

                        <v-btn flat :small="$vuetify.breakpoint.smAndDown" class="secondary ma-1" @click="dialog.show = false">
                            Cancel
                        </v-btn>
                    </v-flex>
                </v-card-actions>
            </v-card>
        </v-dialog>

	</v-container>
</template>

<script>
	// Common components
	const ManageData = () => import("@/components/User/Data/ManageData");
	const loader = () => import("@/components/Loader");

	// Expense components
	const ViewExpanse = () => import("@/components/User/Data/ViewExpense");

	// Reminders components
	const ViewReminder = () => import("@/components/User/Data/ViewReminder");

	export default {
		data(){
			return {
				// Date picker menu
				menu: false,

				// Show bigger datepicker
				showPicker: false,

				// Stores the current month data points for picker
				dataPointers: [],

				// Update current component view
				updateView: 0,

				// Tab navigation
				tabNav:[
					{'title': 'Expenses', component: 'ViewExpanse', parent: 'ManageData', doc: 'expenses'},
					{'title': 'Reminders', component: 'ViewReminder', parent: 'ManageData', doc: 'reminders', excludeFields: ['type', 'value']}
				],

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

				// Current tab selected
				currentTab: 0,

				// Calender is disabled or not
				disableCalender: false,

				// Stores the data of row to be updated
				rowUpdate:{},

				// Manages the delete / restore  dialog box 
				dialog:{
					show: false,
					restore: false,
					loading: true,
					data: false,
					doc: false
				},
			}
		},
		computed:{
			// Set the parent component for current tab component
			parentComponent(){
				if(this.currentTab || this.currentTab == 0 && this.tabNav.hasOwnProperty(this.currentTab)){
					let obj = this.tabNav[this.currentTab];

					if(!obj.hasOwnProperty('parent') || !obj.parent) return false;

					return {
						parent: obj.parent, 
						doc: (obj.hasOwnProperty('doc') && obj.doc) ? obj.doc : false, 
						excludeFields: (obj.hasOwnProperty('excludeFields') && obj.excludeFields.length > 0) ? obj.excludeFields : []
					};
				}
				return false;
			},

			// Dynamically set the data pointers for calender
			dataPointArr(){
				return this.dataPointers;
			}
		},
		components:{
			loader,
			ManageData,
			ViewExpanse,
			ViewReminder
		},
		watch:{
			// Reset dialog values
			'dialog.show'(val){
				if(!val){
					this.dialog.data = false;
					this.dialog.doc = false;
					this.dialog.loading = true;
					this.dialog.restore = false;
				}
			},

			// Watch for current tab change
			currentTab(){
				// Reset event data pointers
				this.dataPointers = [];

				// Trigger child component update
				this.triggerComponentUpdate();
			}
		},
		methods:{
			// Set data for update
			updateData(data){
				this.rowUpdate = data;
			},

			// Trigger update for current component
			triggerComponentUpdate(){
				this.updateView = Math.random();
				this.getEventData();
			},

			// Create data points for calender for all the data
			getEventData(){
				if(this.parentComponent.hasOwnProperty('doc')){
					const expenseDoc = this.$__firebase.firestore.collection(this.parentComponent.doc).doc(this.$__firebase.fireauth.currentUser.uid).collection('data');
					expenseDoc.onSnapshot(snapshot => {
						snapshot.forEach(doc => {
							if(doc.exists){
								// Extract data
								let data = doc.data();

								// Get data & send it back
								const { date: date, month: month, year: year } = data;

								const newDate = new Date();
								newDate.setDate(date);
								newDate.setMonth((month >= 1) ? month - 1 : month);
								newDate.setFullYear(year);

								if(date && month && year){
									let date = newDate.toISOString().substr(0, 10);
									if(new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) && this.dataPointers.indexOf(date) < 0){
										this.dataPointers.push(date);
									}
								}
							}
							
						});
					}, function(err) {
						this.$store.commit('setSnackMsg', err.message)
					});
				}else{
					this.dataPointers = [];
				}
			},

			// Delete requested data
			confirmDelete(doc = false, id = false){
				if(!id || !doc || !id) return false;
				const expenseCollection = doc;

				// Check if document really exists
				const expenseDoc = expenseCollection.doc(id);
				expenseDoc.get().then(doc => {	
					if(doc.exists){
						let data = doc.data();
						data['id'] = id;
						
						// Check if record was previously deleted or not 
						if(data.hasOwnProperty('delete')){
							if(data.delete) this.dialog.restore = true;
							else this.dialog.restore = false;
						}

						// Set dialog values
						this.dialog.show = true;
						this.dialog.data = data;
						this.dialog.loading = false;
						this.dialog.doc = expenseDoc;
					}
				}).catch(err => {
					this.$store.commit('setSnackMsg', err.message);
				});
			},

			// Mark the received document as deleted
			deleteRecord(id, restore = false){
				this.loading = true;

				// Get collection
				const expenseDoc = this.dialog.doc;
				if(!id || !expenseDoc){
					this.loading = false;
					this.dialog.show = false;

					this.$store.commit('setSnackMsg', 'Unknown Error !');
					return false;
				}

				// Set delete value
				let deleteVal = (restore) ? false : true;

				// Perform operation
				expenseDoc.update({
					delete: deleteVal
				}).then(resp => {
					this.$store.commit('setSnackMsg', 'Operation successful');
					
					this.dialog.show = false;
					this.loading = false;

					// Trigger update in current component
					this.triggerComponentUpdate();
				}).catch(err => {
					this.loading = false;
					this.$store.commit('setSnackMsg', err.message);
				});
			}
		},

		mounted(){
			// On mount trigger all the component
			this.triggerComponentUpdate();
		}
	}
</script>

