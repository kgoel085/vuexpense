<template>
	<v-container>
		<v-layout row wrap>
			<v-flex xs12 class="py-2">
				<h2>Add Expense / Income</h2>
			</v-flex>

			<!-- Drop-down -->
			<v-flex xs12>
				<v-select :items="transactionTypes" item-text="name" item-value="value" v-model="selTransType"></v-select>
			</v-flex>

			<!-- Date-picker -->
			<v-flex class="grow">
				<v-dialog
					ref="dialog"
					v-model="dateModal"
					:return-value.sync="date"
					persistent
					lazy
					full-width
					width="290px"
				>
					<template v-slot:activator="{ on }">
						<v-text-field
							v-model="date"
							label="Select date"
							prepend-icon="event"
							readonly
							v-on="on"
						></v-text-field>
					</template>
					<v-date-picker v-model="date" scrollable>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="dateModal = false">Cancel</v-btn>
						<v-btn flat color="primary" @click="$refs.dialog.save(date);dateModal = false">OK</v-btn>
					</v-date-picker>
				</v-dialog>
			</v-flex>

			<!-- Time picker -->
			<v-flex class="grow">
				<v-dialog
					ref="dialog"
					v-model="timeModal"
					:return-value.sync="time"
					persistent
					lazy
					full-width
					width="290px"
				>
					<template v-slot:activator="{ on }">
						<v-text-field
							v-model="time"
							label="Select Time"
							prepend-icon="access_time"
							readonly
							v-on="on"
						></v-text-field>
					</template>
					<v-time-picker
						v-if="timeModal"
						v-model="time"
						full-width
					>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="timeModal = false">Cancel</v-btn>
						<v-btn flat color="primary" @click="$refs.dialog.save(time)">OK</v-btn>
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

			// Current selected transaction type
			selTransType: 1,

			// Date-picker
			dateModal: false,
			date: new Date().toISOString().substr(0, 10),

			// Time picker
			timeModal: false,
			time: null,

			// Entry values
			entryValues: {
				amount: null,

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
			return this.$__firebase.firestore.collection('transactions').doc(this.User.uid);
		} 
	},
	methods:{
		// Get data
		getData(){

		},

		// Show calculator
		showCalculator(){
			EventBus.$emit('showCalc', true);
		}
	},
	mounted(){
		this.getData();

		// Calculator results
		EventBus.$on('calcResults', calVal => {
			console.log(calVal);
			this.entryValues.amount = calVal;
		});
	},
	beforeDestroy(){
		EventBus.$off(['calcResults']);
	}
}
</script>

<style>

</style>