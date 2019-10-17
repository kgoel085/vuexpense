<template>
	<v-layout row wrap>
		<v-flex xs12 class="py-2">
			<v-date-picker v-model="picker" full-width :landscape="true" :reactive="true" :events="getEntryDates" event-color="green lighten-1"></v-date-picker>
		</v-flex>
		<v-slide-y-transition>
			<v-flex xs12 class="py-2" v-if="EntryExists && EntryArr">
				<v-layout row wrap>
					<v-flex class="grow pa-1 " v-for="(item, indx) in this.EntryArr" :key="indx">
						<v-card flat>
							<v-card-title>
								<v-layout row wrap>
									<v-flex class="grow ">
										<h3>{{indx | uppercase}}</h3>
									</v-flex>
									<v-flex class="shrink display-1">
										<span :class="item.color+'--text'"> {{ UserData.getCurrency(item['total']) }} </span>
									</v-flex>
								</v-layout>
							</v-card-title>
							<v-card-text class="pa-0 ma-0 ">
								<v-list >
									<v-list-tile avatar v-for="cItem in item" :key="cItem.amount">
										<v-layout row class="grey--text">
											<v-flex class="grow">
												{{ UserData['find'+indx](cItem.category) }}
												<br />
												<small>{{ cItem.description | truncate(50) }}</small>
											</v-flex>
											<v-flex class="shrink">
												<span>{{ UserData.getCurrency(cItem['amount']) }}</span>
											</v-flex>
										</v-layout>
									</v-list-tile>
								</v-list>
							</v-card-text>
						</v-card>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-slide-y-transition>
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

		// User functions for data retrieval
		UserData(){
			const { currency, expense_types, income_types  } = this.$store.getters.UserSavedSettings

			const findexpense = expense => {
				const findObj = expense_types.find(obj => obj.id == expense)
				if(findObj) return findObj.title

				return 'Others'
			}
			const findincome = income => {
				const findObj = income_types.find(obj => obj.id == income)
				if(findObj) return findObj.title

				return 'Others'
			}

			const getCurrency = val => {
				const currencyObj = currency
				let currencySymbol = ''
				if (currencyObj && currencyObj.hasOwnProperty(0) && currencyObj[0].hasOwnProperty('symbol')) currencySymbol = currencyObj[0].symbol

				return ` ${currencySymbol} ${val} `
			}

			return { getCurrency, findexpense, findincome }
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
		},

		// Returns a normalized entry array
		EntryArr(){
			let returnVal
			if(this.EntryExists){
				returnVal = {}
				this.EntryExists.forEach (obj => {
					const objKey = (obj.color === 'red') ? 'expense' : 'income'
					const findObj = this.TransactionArr[objKey].find(fObj => fObj.date === obj.date)
					
					if(findObj){
						if(!returnVal.hasOwnProperty(objKey)) returnVal[objKey] = []
						returnVal[objKey].push(findObj)
						returnVal[objKey].color = obj.color
					}
				})

				if (Object.keys(returnVal).length > 0) {
					for (let key in returnVal) {
						const currentObj = returnVal[key]
						if (currentObj) {
							let total = 0
							currentObj.forEach(obj => total += obj.amount)
							returnVal[key]['total'] = total
						}	
					}
				}
			}

			return returnVal;
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