<template>
	<v-layout row wrap>
		<v-flex xs12>
			{{calenderDates}}
			<table border="1" style="width:100%">
				<thead>
					<tr>
						<th v-for="(week, indx) in weeks" :key="indx">{{week}}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(week, indx) in weeks" :key="indx">
						<td v-for="(day, dayIndex) in calenderDates[indx]" :key="dayIndex">
							<span v-if="parseInt(day[0]) > 0">{{ day[0] }}</span>
						</td>
					</tr>
				</tbody>
			</table>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	data(){
		return {
			currentDate: new Date(),
			currentYear: new Date().getFullYear(),
			currentMonth: new Date().getMonth(),
			currentDay: new Date().getDate(),
			dates: [],
			weeks: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		}
	},
	computed:{
		// First day of the month
		firstMonthDay(){
			return (new Date(this.currentYear, this.currentMonth)).getDay()
		},

		calenderDates(){
			let date = 1;
			let dateArr = {};

			for(let j = 0; j <= 6; j++){
				let tmpArr = [];
				for(let i = 0; i < 7; i++){
					if(!tmpArr.hasOwnProperty(i)) tmpArr[i] = [];
					if(date > this.checkDaysInMonth(this.currentYear, this.currentMonth)){
						tmpArr[i].push(0);
						break;
					}else if(j === 0 && i < this.firstMonthDay){
						tmpArr[i].push(0);
					}else{
						if(date){
							tmpArr[i].push(date);
							date++;
						}
						
					}
				}
				
				if(tmpArr.length > 1){
					if(!dateArr.hasOwnProperty(j)) dateArr[j] = [];
					dateArr[j] = tmpArr;
				}
			}

			return (Object.keys(dateArr).length > 0) ? dateArr : {};
		}
	},
	methods:{
		// Check days in given month
		checkDaysInMonth(year, month){
			const nYear = (year) ? year : this.currentYear;
			const nMonth = (month) ? month : this.currentMonth;

			return 32 - new Date(nYear, nMonth, 32).getDate();
		}
	},
	mounted(){
		this.createCalender();
	}
}
</script>

<style>

</style>