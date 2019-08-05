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
	const ManageExpense = () => import("@/components/Home/ManageExpense");
	const ViewExpanse = () => import("@/components/Home/ViewExpense");

	export default {
		data(){
			return {
				// Tab navigation
				tabNav:[
					// Expense Data
					{'title': 'Expense Data', component: 'ViewExpanse', parent: 'ManageExpense'}
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

					switch(this.currentTab){
						// Expense manager
						case 0:
							return obj.parent;		
						break;
					}
				}
				return false;
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

