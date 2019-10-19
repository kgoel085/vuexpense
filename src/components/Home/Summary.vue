<template>
	<v-container fluid>
		<v-layout row wrap>
			<v-flex xs12>
				<v-card flat>
					<v-card-title>
						<!-- Current balance -->
						<v-layout row wrap>
							<v-flex class="grow">
								<h3>Current Balance</h3>
							</v-flex>
							<v-flex class="shrink">
								<strong class="success--text display-1">{{ UserCurrencySymbol }}  {{ parseInt(TotalExpenses.total) ? TotalExpenses.total : 0 }}</strong>
							</v-flex>
						</v-layout>
					</v-card-title>
					<v-card-text>
						<v-expansion-panel>
							<v-expansion-panel-content v-for="item in TimeViewItems" :key="item.name">
								<template v-slot:header>
									<v-layout row wrap>
										<v-flex class="grow">
											<strong>{{ item.name | capitalize }}</strong>
										</v-flex>
										<v-flex class="grow" v-if="item.dateFormat">
											<span class="grey--text">{{item.dateFormat}}</span>
										</v-flex>
										<v-flex class="shrink">
											<span class="success--text">{{UserCurrencySymbol}} {{ item.total }}</span>
										</v-flex>
									</v-layout>
								</template>
								
								<v-card flat>
									<v-card-text>
										<template v-if="Object.keys(item.data).length == 0">
											<v-alert :value="true" type="warning">
												No Entries found
											</v-alert>
										</template>

										<template v-else>
											<v-expansion-panel>
												<v-expansion-panel-content v-for="(childItem, indx) in item.data" :key="childItem.id" >
													<template v-slot:header>
														<v-layout row wrap>
															<v-flex class="grow">
																<strong>{{ indx | capitalize }}</strong>
															</v-flex>
															<v-flex class="shrink">
																<span class="grey--text">{{UserCurrencySymbol}} {{ childItem.total }}</span>
															</v-flex>
														</v-layout>
													</template>

													<v-card flat>
														<v-card-text>
															<template v-if="childItem.length == 0">
																<v-alert :value="true" type="warning">
																	No records found !
																</v-alert>
															</template>
															<template v-else>
																<v-list>
																	<v-list-tile v-for="entry in childItem" :key="entry.id">
																		<v-list-tile-content>
																			<v-layout row wrap style="width: 100%">
																				<v-flex class="shrink">
																					<v-btn fab flat small class="transparent" @click="editEntry(entry.id)">
																						<v-icon class="pa-2">edit</v-icon>
																					</v-btn>
																				</v-flex>
																				<v-flex class="grow">
																					<span left>{{ entry.description }}</span> <v-chip light small v-if="$vuetify.breakpoint.smAndUp">{{entry.date}}</v-chip>
																				</v-flex>
																				<v-flex class="shrink">
																					<small class="grey--text"> {{UserCurrencySymbol}} {{ entry.amount }}</small>
																				</v-flex>
																			</v-layout>
																		</v-list-tile-content>
																	</v-list-tile>
																</v-list>
															</template>
															
														</v-card-text>	
													</v-card>
												</v-expansion-panel-content>
											</v-expansion-panel>
										</template>
									</v-card-text>
								</v-card>
							</v-expansion-panel-content>
						</v-expansion-panel>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	data(){
		return{
			// Stores user entered data
			dataArr: [],
		}
	},
	computed:{
		// Current User
		User(){
			return this.$__firebase.fireauth.currentUser;
		},

		// User saved settings
		UserSettings(){
			return this.$store.getters.UserSavedSettings;
		},

		// User saved currency symbol
		UserCurrencySymbol(){
			if(this.UserSettings && this.UserSettings.hasOwnProperty('currency')){
				return this.UserSettings.currency[0].symbol;
			}

			return '';
		},

		// Transactions data document
		TransactionDoc(){
			return this.$__firebase.firestore.collection('transactions').doc(this.User.uid).collection('data');
		},

		// Returns transaction arr
		TransactionArr(){
			let returnVal = false;

			if(this.dataArr && this.dataArr.length > 0){
				const expenseValues = this.dataArr.filter(obj => obj.transactionType == 'expense');
				const incomeValues = this.dataArr.filter(obj => obj.transactionType == 'income');

				if(expenseValues.length > 0 || incomeValues.length > 0){
					returnVal = {
						expense: (expenseValues && expenseValues.length > 0) ? expenseValues : [],
						income: (incomeValues && incomeValues.length > 0) ? incomeValues : [],
					};
				}
			}

			return returnVal;
		},

		// Stores the total expense / income for current data
		TotalExpenses(){
			let expenseTotal = 0
			let incomeTotal = 0;

			if(this.TransactionArr){
				const expenseNumbers = this.TransactionArr['expense'].map(obj => {
					return obj.amount;
				}).reduce((acc, val) => acc + val, 0);
				const incomeNumbers = this.TransactionArr['income'].map(obj => {
					return obj.amount;
				}).reduce((acc, val) => acc + val, 0);

				if(expenseNumbers > 0) expenseTotal = expenseNumbers;
				if(incomeNumbers > 0) incomeTotal = incomeNumbers;
			}
			return {expenseTotal, incomeTotal, total: parseInt(incomeTotal - expenseTotal)};
		},

		// Get time based data
		TimeViewItems(){
			return [
				{...this.filterData('daily')},
				{...this.filterData('weekly')},
				{...this.filterData('monthly')},
				{...this.filterData('yearly')},
			]
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

		// Returns date in time format for provided date
		DateTime(dateVal = false){
			let currentDate = (dateVal) ? new Date(dateVal) : new Date('2019-10-01');

			const year = currentDate.getFullYear();
			const month = (currentDate.getMonth() <= 9) ? '0'+currentDate.getMonth() : currentDate.getMonth();
			const date = (currentDate.getDate() <= 9) ? '0'+currentDate.getDate() : currentDate.getDate();
			const minutes = 0;
			const hour = 0;
			const seconds = 0;

			return new Date(year, month, date, hour, minutes, seconds).getTime();
		},

		// Filter the data
		filterData(filter = 'daily'){
			let returnVal = {name: filter, data: {}, total: 0, dateFormat: false};
			if(!filter) return returnVal;

			const currentDate = new Date();
			let ifConditionMatched = false;

			switch(filter){
				case 'daily':
					returnVal.dateFormat = currentDate.toLocaleDateString();
					ifConditionMatched = date => this.DateTime(date) == this.DateTime();
				break;

				case 'monthly':
					let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
					let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

					returnVal.dateFormat = ` ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
					ifConditionMatched = date => this.DateTime(date) <= endDate.getTime() && this.DateTime(date) >= startDate.getTime();
				break;

				case 'weekly':
					let startWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
					let endWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

					returnVal.dateFormat = ` ${startWeek.toLocaleDateString()} - ${endWeek.toLocaleDateString()}`;
					ifConditionMatched = date => this.DateTime(date) <= endWeek.getTime() && this.DateTime(date) >= startWeek.getTime();
				break;

				case 'yearly':
					let startYear = new Date(currentDate.getFullYear(), 0, 1);
					let endYear = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

					returnVal.dateFormat = ` ${startYear.toLocaleDateString()} - ${endYear.toLocaleDateString()}`;
					ifConditionMatched = date => this.DateTime(date) <= endYear.getTime() && this.DateTime(date) >= startYear.getTime();
				break;
			}

			if(this.TransactionArr && ifConditionMatched){
				Object.keys(this.TransactionArr).forEach(key => {
					let total = 0;
					returnVal['data'][key] = [];

					const currentObj = this.TransactionArr[key];
					currentObj.forEach(obj => {
						if(ifConditionMatched(obj.date)){
							total += obj.amount;
							returnVal['data'][key].push(obj);
						}
					});

					returnVal['data'][key]['total'] = total;
				});

				const expenseTotal = (returnVal['data']['expense']['total']) ? returnVal['data']['expense']['total'] : 0;
				const incomeTotal = (returnVal['data']['income']['total']) ? returnVal['data']['income']['total'] : 0;

				returnVal['total'] = incomeTotal - expenseTotal;
			}

			return returnVal;
		},

		// Edit entry
		editEntry(id = false){
			if(!id) return false

			this.$router.push({name: 'manager', query: {entry: id}})
		}
	},
	mounted(){
		this.getData();
	}
}
</script>

<style>

</style>