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
// Modules
import EventBus from '../helpers/EventBus';

// Components
const Leftbar = () => import('@/components/Home/LeftBar');
const MainContent = () => import('@/components/Home/MainContent');

export default {
	data(){
		return {
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
		// Current tab data
		currentTab(){
			return this.$store.state.home.tabData;
		}
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
		currentTab(val){
			// Process data points for the current tab
			this.processCalenderDataPoints();
		}
	},
	methods:{
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
				EventBus.$emit('date-changed', this.$store.state.home.currentDate);
			}).catch(err => {
				this.loading = false;
				this.$store.commit('setSnackMsg', err.message);
			});
		},

		// Process the received snapshot data and pass processed data to calender
		processCalenderDataPoints(){
			if(!this.currentTab || !this.currentTab.hasOwnProperty('doc')) return false;

			// Get all the available data points
			const doc = this.$__firebase.firestore.collection(this.currentTab.doc).doc(this.$__firebase.fireauth.currentUser.uid).collection('data');
			if(!doc) return false;
			
			let returnVal = false;

			// Get Data
            doc.get().then(snapShot => {
                if(!snapShot.empty){
					snapShot.forEach(doc => {
						if(doc.exists){
							if(!returnVal) returnVal = [];

							let {date, month, year} = doc.data();
							if(month && month >= 1) month -= 1;

							const newDate = new Date();
							newDate.setFullYear(year);
							newDate.setMonth(month);
							newDate.setDate(date);

							const finalDate = newDate.toISOString().substr(0, 10);

							if(returnVal.indexOf(finalDate) < 0) returnVal.push(finalDate);
						}
					});
				}
				
				// Emit the data points to other components
				EventBus.$emit('capture-data-points', returnVal);
            });
		}
	},
	components:{
		Leftbar,
		MainContent
	},
	mounted(){
		// Set vuex variables
		EventBus.$on('date-changed', date => this.$store.commit('setHomeDate', date));
		EventBus.$on('set-tab', tab => {this.$store.commit('setHomeTab', tab); this.processCalenderDataPoints()});
		EventBus.$on('set-tab-data', data => this.$store.commit('setHomeTabData', data));
		EventBus.$on('disable-element', state => this.$store.commit('disableElements', state));
		EventBus.$on('delete-db-data', ({doc, id}) => this.confirmDelete(doc, id));
	},
	beforeDestroy(){
		EventBus.$off(['date-changed', 'set-tab', 'set-tab-data', 'disable-element', 'delete-db-data']);
	}
}
</script>

<style>

</style>
