<template>
	<v-layout row wrap>
		<v-flex xs12 class="pa-1">
			<v-card flat class="pa-0 ma-0">
				<v-card-text class="ma-0">
					<v-layout row wrap>
						<v-flex class="grow">
							<v-text-field full-width outline label="Add category" dense append-icon="add_circle" @click:append="toggleMarker"></v-text-field>
						</v-flex>
					</v-layout>
				</v-card-text>
			</v-card>
			<v-card flat>
				<v-card-title >
					<v-layout row wrap>
						<v-flex class="grow">
							<h2>Manage Categories</h2>
						</v-flex>
						<v-flex class="shrink">
							<loader v-if="loading" class="pa-0 ma-0"></loader>
						</v-flex>	
					</v-layout>
				</v-card-title>
				<v-card-text>
					<template v-if="dataArr.length == 0">
						<v-alert type="warning" :value="true">
							No data found
						</v-alert>
					</template>
					<template v-else>
						<v-layout row wrap>
							<v-flex xs12>
								<v-select :items="dataArr" item-text="title" item-value="id" v-model="selectedCat"></v-select>
							</v-flex>
						</v-layout>
					</template>
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
		return {
			dataArr: [],
			loading: false,
			selectedCat: null
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
		toggleMarker(){
			alert('clicked');
		},

		// Get master data
		getData(){
			this.loading = true;
			this.MasterDoc.get().then(snapshot => {
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						if(doc.exists){
							const data = doc.data();
							data.id = doc.id;

							this.dataArr.push(data);
						}
					});
					this.loading = false;
				}
				//this.loading = false;
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
				this.loading = false;
			})
		}
	},
	mounted(){
		// Get master data
		this.getData();
	}
}
</script>

<style>

</style>