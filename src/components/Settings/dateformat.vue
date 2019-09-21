<template>
	<v-layout row wrap>
		<v-flex xs12 v-for="(item, indx) in items" :key="indx">
			<v-select outline autofocus :items="item.items" item-text="text" item-value="value" :label="item.title"></v-select>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	data(){
		return {
			
		}
	},
	computed:{
		items(){
			let returnObj = {};

			// Add date formats
			const currentDate = new Date();
			let year = currentDate.getFullYear();
			let month = currentDate.getMonth();
			let date = currentDate.getDate();
			
			if(month <= 9) month = '0'+month;
			if(date <= 9) date = '0'+date;

			const dateObj = {y: year, M: month, d: date};

			const formats = ['y-M-d', 'M-d-y', 'd-M-y'];
			const separators = ['-', '/', '.'];

			const dateFormats = [];
			formats.forEach(obj => {
				let newDate = obj.split('-').map(f => {
					return dateObj[f];
				});

				separators.forEach(s => {
					const finalDt = newDate.join(s);
					dateFormats.push({text: ` ${obj.split('-').join(s)} ${finalDt}`, value: obj.split('-').join(s)})
				});
			});

			// Stores all the formats
			if(dateFormats.length > 0){
				returnObj.format = {
					items: dateFormats,
					title: 'Date format'
				}
			}

			// Add First days
			//const firstElems = ['Year', 'Month', 'Week'];
			const firstElems = ['Year', 'Month'];

			firstElems.forEach(obj => {
				let title = 'day', items

				switch(obj){
					case 'Year':
						title = 'month';
						const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

						items = [];
						
						for(let i = 0; i < 12; i++){
							items.push({text: monthNames[i], value: i});
						}
					break;

					case 'Month':
						items = [];
						
						for(let i = 1; i <= 31; i++){
							items.push({text: i, value: i});
						}
					break;

					case 'Week':
						items = [];
						const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
						
						for(let i = 0; i < 7; i++){
							items.push({text: days[i], value: i});
						}
					break;
				}
				returnObj[obj] = {items, title: `First ${title} of ${obj}`};
			});

			return returnObj;
		}
	}
}
</script>

<style>

</style>