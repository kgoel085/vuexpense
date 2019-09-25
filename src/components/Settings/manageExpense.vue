<template>
	<v-layout row wrap>
		<v-flex xs12 class="pa-1">
			<v-card flat class="pa-0 ma-0">
				<v-card-text class="ma-0">
					<v-layout row wrap>
						<v-flex class="grow">
							<v-text-field full-width outline label="Add category" v-model="newCategory" :disabled="(dataArr.length == 0) ? true : false" :append-icon="newCategory ? 'add_circle' : ''"  @click:append="addNewCategory"></v-text-field>
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
							<v-flex xs12>
								<template v-if="!selectedCatChild">
									No Category selected
								</template>
								<template v-else>
									<v-layout row wrap>
										<v-flex xs12 class="ma-1">
											<v-text-field type="text" label="Add new item" outline v-model="newItem" full-width :append-icon="newItem ? 'add_circle' : ''" @click:append="addNewItem"></v-text-field>
										</v-flex>
										<v-flex xs12 v-for="item in selectedCatChild" :key="item.id" class="ma-1">
											<v-text-field single-line type="text" outline v-model="item.title" full-width @input="item.dirty = true"></v-text-field>
										</v-flex>
									</v-layout>
								</template>
							</v-flex>
						</v-layout>
					</template>
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs12 class="text-xs-center">
							<v-slide-y-transition>
								<v-btn flat class="primary" fixed bottom v-if="showUpdateBtn && selectedCatChild" @click="updateChild">
									Update
								</v-btn>
							</v-slide-y-transition>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-flex>
	</v-layout>
</template>

<script>
import EventBus from '../../helpers/EventBus';
const loader = () => import('../Loader');
import Firebase from 'firebase/app'

export default {
	data(){
		return {
			dataArr: [],
			loading: false,
			selectedCat: null,
			selectedCatChild: null,
			newItem: null,
			newCategory: null
		}
	},
	watch:{
		selectedCat(val){
			if(val) this.selectedCatChild = null;

			const findObj = this.dataArr.find(obj => obj.id === val);
			this.selectedCatChild = (findObj && findObj.hasOwnProperty('data')) ? findObj.data : null;
		}
	},
	components:{
		loader
	},
	computed:{
		// Master data
		MasterDoc(){
			return this.$__firebase.firestore.collection('master').doc('data').collection('expense_category');
		},

		// Show update button for category child's
		showUpdateBtn(){
			let returnVal = false;
			if(this.selectedCatChild){
				for(let obj of this.selectedCatChild){
					if(obj.dirty){
						returnVal = true;
						break;
					}
				}
			}

			return returnVal;
		}
	},
	methods:{
		// Get master data
		getData(refresh = false){
			if(refresh){
				this.selectedCat = null;
				this.dataArr = [];
			}

			this.loading = true;
			this.MasterDoc.orderBy('title', 'asc').get().then(snapshot => {
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						if(doc.exists){
							const data = doc.data();
							data.id = doc.id;

							data.data = data.data.map(obj => {
								obj.dirty = false;
								return obj;
							});

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
		},

		// Add new category
		addNewCategory(){
			const newCategory = this.newCategory;
			if(!newCategory) return false;

			this.loading = true;

			// Check if same category already exists or not
			const categoryExists = this.dataArr.find(obj => obj.title.toLowerCase() === newCategory.toLowerCase());
			if(categoryExists){
				this.$store.commit('setSnackMsg', 'Category already exists');
				this.newCategory = null;
				this.loading = false;
				return false;
			}

			// Add category to DB
			const newCatDoc = this.MasterDoc.doc();
			newCatDoc.set({
				title: newCategory,
				del: false,
				data: []
			}).then(result => {
				this.$store.commit('setSnackMsg', 'Category added successfully');
				this.newCategory = null;
				this.getData(true);
				this.loading = false;
			}).catch(err => {
				this.loading = false;
				this.$store.commit('setSnackMsg', err.message);
			});
		},

		// Add new item
		addNewItem(){
			const newItem = this.newItem;
			if(!newItem) return false;

			this.loading = true;

			// Check if same item already exists or not
			const itemCatExist = this.dataArr.find(obj => obj.id === this.selectedCat);
			if(itemCatExist){
				const itemExist = itemCatExist.data.find(dt => dt.title.toLowerCase() === newItem.toLowerCase());
				if(itemExist){
					this.$store.commit('setSnackMsg', 'Item already exists');
					this.newItem = null;
					this.loading = false;
					return false;
				}
			}

			const categoryDoc = this.MasterDoc.doc(this.selectedCat);
			categoryDoc.update({
				data: Firebase.firestore.FieldValue.arrayUnion({title: newItem, del: false})
			}).then(result => {
				this.$store.commit('setSnackMsg', 'Item added successfully');
				this.newItem = null;
				this.getData(true, this.selectedCat);
				this.loading = false;
			}).catch(err => {
				this.loading = false;
				this.$store.commit('setSnackMsg', err.message);
			})
		},

		// Update current category child's 
		updateChild(){
			let catChild = this.selectedCatChild;
			if(catChild){
				this.loading = true;
				catChild = catChild.map(obj => {
					delete obj.dirty;
					return obj;
				});

				const categoryDoc = this.MasterDoc.doc(this.selectedCat);
				categoryDoc.update({
					data: catChild
				}).then(result => {
					this.getData(true);
					this.$store.commit('setSnackMsg', 'Update success');
					this.loading = false;
				}).catch(err => {
					this.loading = false;
					this.$store.commit('setSnackMsg', err.message);
				});

				return false;
			}

			this.$store.commit('setSnackMsg', 'Error Occurred !');
			return false;
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