<template>
	<v-layout row wrap>
		<v-flex xs12>
			<loader v-if="dataArr.length == 0"></loader>

			<v-card flat v-else>
				<v-card-text>
					<v-text-field label="Search types" v-model="searchTxt" @input="searchTypes"></v-text-field>
					<v-expansion-panel>
						<v-expansion-panel-content v-for="item in dataArr" :key="item.id">
							<template v-slot:header>
								<div>{{item.title}}</div>
							</template>

							<v-card>
								<v-card-text>
									<v-list>
										<v-list-tile v-for="dataItem in item.data" :key="dataItem.id">
											<v-list-tile-content>
												<v-list-tile-title>{{ dataItem.title }}</v-list-tile-title>
											</v-list-tile-content>

											<v-list-tile-action>
												<v-switch
													v-model="dataItem.active"
												></v-switch>
											</v-list-tile-action>
										</v-list-tile>
									</v-list>
								</v-card-text>
							</v-card>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-card-text>
			</v-card>
		</v-flex>
	</v-layout>
</template>

<script>
import EventBus from '../../helpers/EventBus';
const loader = () => import('../Loader');

export default {
	data(){
		return{
			dataArr: [],
			searchTxt: null
		}		
	},
	components:{
		loader
	},
	computed:{
		// Master data
		MasterDoc(){
			return this.$__firebase.firestore.collection('master').doc('data').collection('expense_category').orderBy('title', 'asc');
		}
	},
	methods:{
		// Get master data
		getMasterData(){
			this.MasterDoc.get().then(snapshot => {
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						if(doc.exists){
							const docData = doc.data();
							docData.id = doc.id;

							docData.data = docData.data.map(obj => {
								obj.active = (obj.del) ? false : true;
								return {...obj};
							});

							this.dataArr.push(docData);
						}
					})
				}
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message)
			});
		},

		// Search specific types
		searchTypes(){
			if(!this.searchTxt) return false;

			// Declare variables
			let input, filter, list, item, txtValue;

			input = this.searchTxt;
			filter = input.toString().toUpperCase();

			list = document.querySelectorAll('li.v-expansion-panel__container');

			if(list){
				list.forEach(obj => {
					item = obj.querySelector('.v-expansion-panel__header div');
					txtValue = item.textContent || item.innerText;

					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						obj.style.display = "";
					} else {
						obj.style.display = "none";
					}
				});
			}
		}
	},
	mounted(){
		this.getMasterData();
	}
}
</script>

<style>

</style>