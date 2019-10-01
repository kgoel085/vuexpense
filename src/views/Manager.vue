<template>
	<v-container>
		<v-layout row wrap>
			<v-flex xs12 class="py-2">
				<h2>Add Expense / Income</h2>
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
					:return-value.sync="entryValues.date"
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
						<v-btn flat color="primary" @click="$refs.dialog.save(entryValues.date);dateModal = false">OK</v-btn>
					</v-date-picker>
				</v-dialog>
			</v-flex>

			<!-- Time picker -->
			<v-flex class="grow">
				<v-dialog
					ref="dialog"
					v-model="timeModal"
					:return-value.sync="entryValues.time"
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
						<v-btn flat color="primary" @click="$refs.dialog.save(entryValues.time)">OK</v-btn>
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
				<v-select :items="PayeeOrPayerData.data" item-text="title" item-value="id" :label="PayeeOrPayerData.name" @input="setPayeePayer"></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select :items="ExpenseOrIncomeCategory.data" item-text="title" item-value="id" :label="ExpenseOrIncomeCategory.name" v-model="entryValues.categoryId"></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select :items="PaymentMethods.data" item-text="title" item-value="id" :label="PaymentMethods.name" v-model="entryValues.paymentMethod"></v-select>
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
				<v-combobox
					v-model="entryValues.tags"
					:items="TagTypes.data"
					item-text="title"
					item-value="id"
					:label="TagTypes.name"
					multiple
				></v-combobox>
			</v-flex>
		</v-layout>
		<v-layout row wrap>
			<v-flex xs12 class="text-xs-center">
				<v-slide-y-transition>
					<v-btn flat class="success" fixed bottom v-if="entryValues.amount" @click="saveEntry">Save</v-btn>
				</v-slide-y-transition>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import EventBus from '../helpers/EventBus';

export default {
	data(){
		return {
			// Transaction types
			transactionTypes: [
				{name: 'Expense', value: 1},
				{name: 'Income', value: 2},
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
				amount: null,	// Amount
				transactionType: 1,	// Current selected transaction type
				payerId: false,
				payeeId: false,
				date: new Date().toISOString().substr(0, 10),
				time: null,
				categoryId: false,
				paymentMethod: false,
				description: null,
				tags: []
			}
		}
	},
	watch:{
		// Reset values
		'entryValues.transactionType'(val){
			this.entryValues.payerId = null;
			this.entryValues.payeeId = null;
			this.entryValues.categoryId = null;
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
			const arrKey = (this.entryValues.transactionType == 1) ? 'payee_list' : 'payer_list';
			const name = (this.entryValues.transactionType == 1) ? 'Payee' : 'Payer';

			const returnVal = this.getUserSavedData(arrKey);
			return {name, data: returnVal};
		},

		// Expense / Income category
		ExpenseOrIncomeCategory(){
			const arrKey = (this.entryValues.transactionType == 1) ? 'expense_types' : 'income_types';
			const name = 'Category';

			const returnVal = this.getUserSavedData(arrKey);
			return {name, data: returnVal};
		},

		// Payment Methods
		PaymentMethods(){
			const arrKey = 'payment_methods';
			const name = 'Payment Method';

			const returnVal = this.getUserSavedData(arrKey);
			return {name, data: returnVal}; 
		},

		// Tags data
		TagTypes(){
			const arrKey = 'entry_tags';
			const name = 'Tags';

			const returnVal = this.getUserSavedData(arrKey);
			return {name, data: returnVal}; 
		}
	},
	methods:{
		// Get data
		getData(){
			this.UserSaveData.forEach(obj => {
				this.UserSettingDoc.collection(obj.collection.toString()).where('del', '==', false).get().then(snapshot => {
					if(!snapshot.empty){
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
		getUserSavedData(key = false){
			let returnVal = [];

			const currentObj = this.UserSaveData.find(obj => obj.collection === key);
			if(currentObj && currentObj.hasOwnProperty('data') && currentObj.data.length > 0) returnVal = currentObj.data;

			return returnVal;
		},

		// Show calculator
		showCalculator(){
			EventBus.$emit('showCalc', true);
		},

		// Set payer / payee
		setPayeePayer(val = false){
			if(!val) return false;

			const key = (this.entryValues.transactionType == 1) ? 'payeeId' : 'payerId';
			this.entryValues[key] = val;
		},

		// Save user entry
		saveEntry(){
			let dataEntry = this.entryValues;

			const newDoc = this.SaveDoc.doc();
			newDoc.set(dataEntry).then(result => {
				this.$store.commit('setSnackMsg', 'Entry success');
				this.$router.push({name: 'home'});
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
			});
		}
	},
	mounted(){
		// Get user saved data
		this.getData();

		// Calculator results
		EventBus.$on('calcResults', calVal => {
			this.entryValues.amount = calVal;
			this.$store.commit('setNav', true);
		});
	},
	beforeDestroy(){
		EventBus.$off(['calcResults']);
	}
}
</script>

<style>

</style>