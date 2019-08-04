<template>
	<v-container fluid>
		<v-layout row wrap>
			<!-- Fetch expense data for specific date -->
			<v-flex xs12 md3 class="pa-1">
				<v-date-picker v-model="expenseDate" :reactive="true" full-width class="mt-3" :disabled="disableCalender"></v-date-picker>

				<!-- Add / Update Data -->
				<ManageExpense :date="expenseDate" @disableFields="disableCalender = !disableCalender" :updateObj="rowUpdate" @resetUpdate="rowUpdate = {}"></ManageExpense>
			</v-flex>

			<v-flex xs12 md9 class="pa-1">
				<v-tabs v-model="currentTab" slider-color="secondary" fixed-tabs :key="expenseDate">
					<!-- Show data -->
					<v-tab key="showData" ripple>
						Expense Data
					</v-tab>

					<v-tab-item key="showData">
						<ViewExpanse :expenseDate="expenseDate" :disableElem="disableCalender" @updateRow="updateData"></ViewExpanse>
					</v-tab-item>
				</v-tabs>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
	import loader from '@/components/Loader'
	import ManageExpense from '@/components/User/ManageExpense'
	import ViewExpanse from '@/components/User/ViewExpense'

	export default {
		data(){
			return {
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
				rowUpdate:{}
			}
		},
		components:{
			loader,
			ManageExpense,
			ViewExpanse
		},
		methods:{
			// Set data for update
			updateData(data){
				this.rowUpdate = data;
			}
		}
	}
</script>

