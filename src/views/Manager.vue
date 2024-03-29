<template>
	<v-container>
		<v-layout row wrap>
			<v-flex xs12 class="py-2">
				<v-layout row wrap>
					<v-flex class="grow">
						<h2>Add Expense / Income</h2>
					</v-flex>
					<v-flex class="shrink">
						<loader class="ma-0" v-if="loading"></loader>
					</v-flex>
				</v-layout>
			
			</v-flex>

			<!-- Drop-down -->
			<v-flex xs12>
				<v-select :items="transactionTypes" item-text="name" item-value="value" v-model="entryValues.transactionType"></v-select>
			</v-flex>

			<!-- Date-picker -->
			<v-flex class="grow">
				<v-dialog
					ref="dialog"
					v-model="dateModal"
					persistent
					lazy
					full-width
					width="290px"
				>
					<template v-slot:activator="{ on }">
						<v-text-field
							v-model="entryValues.date"
							label="Select date"
							prepend-icon="event"
							readonly
							v-on="on"
						></v-text-field>
					</template>
					<v-date-picker v-model="entryValues.date" scrollable>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="dateModal = false">Cancel</v-btn>
						<v-btn flat color="primary" @click="dateModal = false">OK</v-btn>
					</v-date-picker>
				</v-dialog>
			</v-flex>

			<!-- Time picker -->
			<v-flex class="grow">
				<v-dialog
					ref="dialog"
					v-model="timeModal"
					persistent
					lazy
					full-width
					width="290px"
				>
					<template v-slot:activator="{ on }">
						<v-text-field
							v-model="entryValues.time"
							label="Select Time"
							prepend-icon="access_time"
							readonly
							v-on="on"
						></v-text-field>
					</template>
					<v-time-picker
						v-if="timeModal"
						v-model="entryValues.time"
						full-width
					>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="timeModal = false">Cancel</v-btn>
						<v-btn flat color="primary" @click="timeModal = false">OK</v-btn>
					</v-time-picker>
				</v-dialog>
			</v-flex>
		</v-layout>

		<v-layout row wrap>
			<v-flex class="grow">
				<!-- Amount -->
				<v-text-field v-model="entryValues.amount" label="Enter amount" regular type="number" append-icon="keyboard" @click:append="showCalculator"></v-text-field>
			</v-flex>
		</v-layout>

		<v-layout row wrap>
			<v-flex xs12>
				<v-select :items="PayeeOrPayerData.data" item-text="title" item-value="id" :label="PayeeOrPayerData.name" :append-icon="PayeeOrPayerData.icon" @click:append="showSettingPage({name: PayeeOrPayerData.iconRoute})" v-model="entryValues.identity"></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select :items="ExpenseOrIncomeCategory.data" item-text="title" item-value="id" :label="ExpenseOrIncomeCategory.name" v-model="entryValues.category" :append-icon="ExpenseOrIncomeCategory.icon" @click:append="showSettingPage({name: ExpenseOrIncomeCategory.iconRoute})"></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select :items="PaymentMethods.data" item-text="title" item-value="id" :label="PaymentMethods.name" v-model="entryValues.paymentMethod" :append-icon="PaymentMethods.icon" @click:append="showSettingPage({name: PaymentMethods.iconRoute})"></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select :items="statusTypes.data" item-text="title" item-value="id" :label="statusTypes.name" v-model="entryValues.status" :append-icon="statusTypes.icon" @click:append="showSettingPage({name: statusTypes.iconRoute})"></v-select>
			</v-flex>
			<v-flex xs12>
				<v-textarea
					v-model="entryValues.description"
					auto-grow
					box
					color="primary"
					label="Description"
					rows="1"
				></v-textarea>
			</v-flex>
			<v-flex xs12>
				<v-select
					v-model="entryValues.tags"
					:items="TagTypes.data"
					item-text="title"
					item-value="title"
					:return-object="false"
					:label="TagTypes.name"
					:append-icon="TagTypes.icon" 
					@click:append="showSettingPage({name: TagTypes.iconRoute})"
					multiple
				></v-select>
			</v-flex>
		</v-layout>
		<v-layout row wrap>
			<v-flex xs12 class="text-xs-center">
				<v-slide-y-transition>
					<v-btn flat class="success" fixed bottom v-if="entryValues.amount" @click="saveEntry">Save</v-btn>
				</v-slide-y-transition>
			</v-flex>
		</v-layout>

		<v-layout row wrap>
			<v-flex xs12>
				<v-dialog v-model="modalShow" persistent scrollable>
					<v-card flat>
						<v-card-text>
							<component :is="currentModalComponent" :pgType="currentModalProp"></component>
						</v-card-text>
						<v-card-actions>
							<v-layout row wrap>
								<v-flex xs12class="text-xs-center">
									<v-btn class="red white--text" @click="modalShow = false; currentModalProp = null; currentModalComponent = null;" >Close</v-btn>
								</v-flex>
							</v-layout>
						</v-card-actions>
					</v-card>
					
				</v-dialog>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import EventBus from '../helpers/EventBus';
const manageList = () => import('./../components/Settings/manageList.vue')
const loader = () => import('./../components/Loader')

export default {
	data(){
		return {
			// Transaction types
			transactionTypes: [
				{name: 'Expense', value: 'expense'},
				{name: 'Income', value: 'income'},
			],

			// Date-picker
			dateModal: false,

			// Time picker
			timeModal: false,

			// User saved data
			UserSaveData: [
				{data: [], collection: 'payer_list'},
				{data: [], collection: 'payee_list'},
				{data: [], collection: 'income_types'},
				{data: [], collection: 'expense_types'},
				{data: [], collection: 'entry_status'},
				{data: [], collection: 'entry_tags'},
				{data: [], collection: 'payment_methods'},
			],

			// Entry values
			entryValues: {
				amount: 0,	// Amount
				transactionType: 'expense',	// Current selected transaction type
				identity: null,
				date: new Date().toISOString().substr(0, 10),
				time: null,
				category: null,
				paymentMethod: null,
				description: null,
				tags: [],
				status: null
			},

			// Modal component
			currentModalProp: null,
			currentModalComponent: null,
			modalShow: false,

			// Request loading
			loading: false
		}
	},
	components: {
		manageList,
		loader
	},
	watch:{
		// Reset values
		'entryValues.transactionType'(val){
			if(!this.editId){
				this.entryValues.payer = null;
				this.entryValues.payee = null;
				this.entryValues.category = null;
			}
		}
	},
	computed:{
		// Current user
		User(){
			return this.$__firebase.fireauth.currentUser;
		},

		// Current user save document
		SaveDoc(){
			return this.$__firebase.firestore.collection('transactions').doc(this.User.uid).collection('data');
		},

		// CUrrent user saved settings document
		UserSettingDoc(){
			return this.$__firebase.firestore.collection('settings').doc(this.User.uid);
		},

		// Payer/Payee data
		PayeeOrPayerData(){
			const arrKey = (this.entryValues.transactionType == 'expense') ? 'payee_list' : 'payer_list';
			const name = (this.entryValues.transactionType == 'expense') ? 'Payee' : 'Payer';
			const iconRoute = (this.entryValues.transactionType == 'expense') ? 'settings.payee_list' : 'settings.payer_list';

			const returnVal = this.getUserSavedData[arrKey];
			return {name, data: returnVal, iconRoute, icon: 'perm_identity' };
		},

		// Expense / Income category
		ExpenseOrIncomeCategory(){
			const arrKey = (this.entryValues.transactionType == 'expense') ? 'expense_types' : 'income_types';
			const iconRoute = (this.entryValues.transactionType == 'expense') ? 'settings.expense_types' : 'settings.income_types';
			const name = 'Category';

			const returnVal = this.getUserSavedData[arrKey];
			return {name, data: returnVal, iconRoute, icon: 'style'};
		},

		// Payment Methods
		PaymentMethods(){
			const arrKey = 'payment_methods';
			const name = 'Payment Method';

			const returnVal = this.getUserSavedData[arrKey];
			return {name, data: returnVal, iconRoute: 'settings.payment_methods', icon: 'payment'}; 
		},

		// Status types
		statusTypes(){
			const arrKey = 'entry_status';
			const name = 'Status';

			const returnVal = this.getUserSavedData[arrKey];
			return {name, data: returnVal, iconRoute: 'settings.entry_status', icon: 'done_outline'}; 
		},

		// Tags data
		TagTypes(){
			const arrKey = 'entry_tags';
			const name = 'Tags';

			const returnVal = this.getUserSavedData[arrKey];
			return {name, data: returnVal, iconRoute: 'settings.entry_tags', icon: 'bookmarks'}; 
		},

		getUserSavedData(){
			let returnVal = {}

			const settingKeys = ['payee_list', 'payer_list', 'expense_types', 'income_types', 'payment_methods', 'entry_status', 'entry_tags']
			settingKeys.forEach(key => {
				const usrData = this.getUserData(key)
				if(!returnVal.hasOwnProperty(key)) returnVal[key] = []

				returnVal[key] = usrData
			});

			return returnVal
		},

		// Edit a received id data
		editId(){
			const editId = (this.$route.query.entry) ? this.$route.query.entry : false
			return editId
		}
	},
	methods:{
		// Fetch data for received edit id 
		fetchData(id = false){
			if (id) {
				this.loading = true;
				const transDoc = this.$__firebase.firestore.collection('transactions').doc(this.User.uid).collection('data').doc(id);
				transDoc.get().then(doc => {
					if (doc.exists) {
						const data = doc.data()
						if(data) data.id = doc.id

						this.entryValues = data
						this.loading = false;
					}
				}).catch(err => {
					this.$store.commit('setSnackMsg', err.message)
					this.loading = false;
				})
			}

			return false
		},

		// Get user saved configuration data
		getData(refresh = false){
			this.UserSaveData.forEach(obj => {
				this.UserSettingDoc.collection(obj.collection.toString()).where('del', '==', false).get().then(snapshot => {
					if(!snapshot.empty){
						if (refresh) obj.data = []

						snapshot.forEach(doc => {
							if(doc.exists){
								const data = doc.data();
								data.id = doc.id;

								// if(this.UserSavedData[obj.arr] && !this.UserSavedData[obj.arr].find(object => object.title === data.title)) this.UserSavedData[obj.arr].push(data);
								if(obj.data && !obj.data.find(object => object.title === data.title)) obj.data.push(data);
							}
						})
					}
				}).catch(err => {
					this.$store.commit('setSnackMsg', err.message);
				});
			});
		},

		// Get user saved data
		getUserData(key = false){
			let returnVal = [];

			const currentObj = this.UserSaveData.find(obj => obj.collection === key);
			if(currentObj && currentObj.hasOwnProperty('data') && currentObj.data.length > 0) returnVal = currentObj.data;

			return returnVal;
		},

		// Show settings page so that user can enter new values
		showSettingPage({ name = false }){
			if (name && name.includes('.')) {
				const prop = name.split('.').pop()
				this.currentModalProp = prop
				this.modalShow = true
				this.currentModalComponent = 'manageList'
			}

			return false
		},

		// Show calculator
		showCalculator(){
			EventBus.$emit('showCalc', true);
		},

		// Save user entry
		saveEntry(){
			let dataEntry = this.entryValues;
			if(dataEntry.hasOwnProperty('amount')) dataEntry.amount = parseInt(dataEntry.amount);

			this.loading = true;
			const newDoc = (this.editId) ? this.SaveDoc.doc(this.editId) : this.SaveDoc.doc();
			newDoc.set(dataEntry).then(result => {
				this.$store.commit('setSnackMsg', 'Entry success');
				this.$router.push({name: 'home'});
				this.loading = false;
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
				this.loading = false;
			});
		}
	},
	mounted(){
		// Get user saved data
		this.getData();

		// Fetch requested data
		if(this.editId) this.fetchData(this.editId);

		// Calculator results
		EventBus.$on('calcResults', calVal => {
			this.entryValues.amount = calVal;
			this.$store.commit('setNav', true);
		});

		EventBus.$on('SettingsSaved', stat => {
			this.getData(true);
		});
	},
	beforeDestroy(){
		EventBus.$off(['calcResults', 'SettingsSaved']);
	}
}
</script>

<style>

</style>