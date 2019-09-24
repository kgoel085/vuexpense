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
								<v-layout row wrap>
									<v-flex class="grow">
										{{item.title}}
									</v-flex>
									<v-flex class="shrink">
										<v-switch
											color="primary"
											v-model="selectedArr[item.id]['active']"
											@change="setDelValues(item.id)"
										></v-switch>
									</v-flex>
								</v-layout>
							</template>

							<v-card>
								<v-card-text>
									<v-list>
										<v-list-tile v-for="(dataItem, indx) in item.data" :key="dataItem.id">
											<v-list-tile-content>
												<v-list-tile-title>{{ dataItem.title }}</v-list-tile-title>
											</v-list-tile-content>

											<v-list-tile-action>
												<v-switch
													color="secondary"
													v-model="selectedArr[item.id]['data'][indx]"
													@change="setDelValues(item.id)"
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
			selectedArr: {},
			searchTxt: null
		}		
	},
	components:{
		loader
	},
	computed:{
		// Master data
		MasterDoc(){
			return this.$__firebase.firestore.collection('master').doc('data').collection('expense_category');
		}
	},
	methods:{
		// Get master data
		getMasterData(refresh = false){
			if(refresh) this.dataArr = [];

			this.MasterDoc.orderBy('title', 'asc').get().then(snapshot => {
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						if(doc.exists){
							let newModelObj = {};
							const docData = doc.data();
							docData.id = doc.id;
							newModelObj = {active : (docData.del) ? false : true, data: {}};

							docData.data = docData.data.map((obj, key) => {
								newModelObj['data'][key] = (obj.del) ? false : true;
								return {...obj};
							});

							this.selectedArr[docData.id] = newModelObj;
							this.dataArr.push(docData);
						}
					});
				}
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message)
			});
		},

		// Search specific types
		searchTypes(){
			if(!this.searchTxt){
				let list = document.querySelectorAll('li.v-expansion-panel__container');
				list = Array.from(list);

				list.forEach(obj => obj.style.display = "");
				return false;
			}

			// Declare variables
			let input, filter, list, item, txtValue;

			input = this.searchTxt;
			filter = input.toString().toUpperCase();

			list = document.querySelectorAll('li.v-expansion-panel__container');
			list = Array.from(list);

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
		},

		// Store the saved data
		setDelValues(id){
			const catObj = this.dataArr.find(obj => obj.id === id);
			let saveObj = {...catObj};

			// Stores the current model value
			const valObj = this.selectedArr[id];

			saveObj.del = !valObj['active'];

			saveObj.data = saveObj.data.map((obj, key) => {
				obj.del = !valObj['data'][key];

				if(saveObj.del) obj.del = saveObj.del;
				else obj.del = !valObj['data'][key];
				 
				return obj;
			});

			delete saveObj.id;

			this.MasterDoc.doc(id).set(saveObj).then(result => {
				this.$store.commit('setSnackMsg', 'Data update success');
				//this.getMasterData(true);
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
			})
		}
	},
	mounted(){
		this.getMasterData();
	}
}
</script>

<style>

</style>