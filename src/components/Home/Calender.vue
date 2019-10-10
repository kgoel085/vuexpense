<template>
	<v-layout row wrap>
		<v-flex xs12 class="py-2">
			<v-date-picker v-model="picker" full-width :landscape="true" :reactive="true" :events="getEntryDates" event-color="green lighten-1"></v-date-picker>
		</v-flex>
		<v-flex xs12 class="py-2" v-if="EntryExists">
			Entry exists
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	data(){
		return {
			picker: new Date().toISOString().substr(0, 10),
			dataArr: []
		}
	},
	computed:{
		// Current User
		User(){
			return this.$__firebase.fireauth.currentUser;
		},

		// Transactions data document
		TransactionDoc(){
			return this.$__firebase.firestore.collection('transactions').doc(this.User.uid).collection('data');
		},

		// Returns transaction arr
		TransactionArr(){
			let returnVal = false;

			if(this.dataArr && this.dataArr.length > 0){
				let expenseValues = this.dataArr.filter(obj => obj.transactionType == 'expense');
				let incomeValues = this.dataArr.filter(obj => obj.transactionType == 'income');

				if(expenseValues.length > 0 || incomeValues.length > 0){
					expenseValues = expenseValues.map(obj => {
						return {...obj, color: 'red'}
					});
					incomeValues = incomeValues.map(obj => {
						return {...obj, color: 'green'}
					});

					returnVal = {
						expense: (expenseValues && expenseValues.length > 0) ? expenseValues : [],
						income: (incomeValues && incomeValues.length > 0) ? incomeValues : [],
					};
				}
			}

			return returnVal;
		},

		// Check whether current date has any entry or not
		EntryExists(){
			if(this.picker && this.TransactionArr){
				let chkVal = [];
				Object.keys(this.TransactionArr).forEach(key => {
					this.TransactionArr[key].forEach(obj => {
						if(obj.date == this.picker && !chkVal.find(chl => {return (chl.date == this.picker && chl.color == obj.color )})) chkVal.push({date: obj.date, color: obj.color});
					});
				});

				if(chkVal.length > 0) return chkVal;
			}

			return false;
		}
	},
	methods:{
		// Get all the data
		getData(){
			this.TransactionDoc.orderBy('date', 'desc').get().then(snapshot => {
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						if(doc.exists){
							const data = doc.data();
							data.id = doc.id;

							this.dataArr.push(data);
						}
					})
				}
			}).catch(err => {
				this.$store,commit('setSnackMsg', err.message);
			})
		},

		// Get the dates with entries
		getEntryDates(date = false){
			let returnVal = [];
			if(this.TransactionArr){
				Object.keys(this.TransactionArr).forEach(key => {
					this.TransactionArr[key].forEach(obj => {
						if(obj.date == date && !returnVal.find(chl => chl.color == obj.color)) returnVal.push(obj.color);
					});
				});
			}

			if(returnVal.length == 0) returnVal = false;
			else returnVal = Array.from(new Set(returnVal));

			return returnVal;
		}
	},
	mounted(){
		// Get the expense data
		this.getData();
	}
}
</script>

<style>

</style>