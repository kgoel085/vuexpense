<template>
	<v-container fluid>
		<v-layout row wrap>
			<!-- Fetch expense data for specific date -->
			<v-flex xs12 md3 class="pa-1">
				<v-date-picker v-model="expenseDate" :reactive="true" full-width class="mt-3" :disabled="disableCalender"></v-date-picker>

				<!-- Add / Update Data -->
				<component :is="parentComponent" :date="expenseDate" @disableFields="disableCalender = !disableCalender" :updateObj="rowUpdate" @resetUpdate="rowUpdate = {}" v-if="parentComponent"></component>
			</v-flex>

			<v-flex xs12 md9 class="pa-1">
				<v-tabs v-model="currentTab" slider-color="secondary" fixed-tabs :key="expenseDate">
					<!-- Show data -->
					<v-tab v-for="(tab, indx) in tabNav" :key="indx" ripple>
						{{ tab.title }}
					</v-tab>

					<v-tab-item v-for="(tab, indx) in tabNav" :key="indx">
						<component :is="tab.component" :expenseDate="expenseDate" :disableElem="disableCalender" @updateRow="updateData"></component>
					</v-tab-item>
				</v-tabs>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
	const loader = () => import("@/components/Loader");

	// Common components
	const ManageData = () => import("@/components/Home/ManageData");

	// Expense components
	const ViewExpanse = () => import("@/components/Home/ViewExpense");

	// Reminders components
	const ViewReminder = () => import("@/components/Home/ViewReminder");

	export default {
		data(){
			return {
				// Tab navigation
				tabNav:[
					{'title': 'Expenses', component: 'ViewExpanse', parent: 'ManageData'},
					{'title': 'Reminders', component: 'ViewReminder', parent: 'ManageData'}
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
				rowUpdate:{}
			}
		},
		computed:{
			// Set the parent component for current tab component
			parentComponent(){
				if(this.currentTab || this.currentTab == 0 && this.tabNav.hasOwnProperty(this.currentTab)){
					let obj = this.tabNav[this.currentTab];

					if(!obj.hasOwnProperty('parent') || !obj.parent) return false;

					return obj.parent;
				}
				return false;
			}
		},
		components:{
			loader,
			ManageData,
			ViewExpanse,
			ViewReminder
		},
		methods:{
			// Set data for update
			updateData(data){
				this.rowUpdate = data;
			}
		}
	}
</script>

