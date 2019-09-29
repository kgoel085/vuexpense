<template>
	<v-layout>
		<v-flex xs12>
			<v-card flat>
				<v-card-title>
					<v-layout row wrap>
						<v-flex class="grow">
							<h2>Manage {{PgTitle}}: </h2>
						</v-flex>
						<v-flex class="shrink">
							<loader class="ma-0" v-if="loading"></loader>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-card-text :key="PgType">
					<v-layout row wrap>
						<v-flex xs12>
							<v-text-field label="Add item" v-model="newItem" :append-icon="newItem ? 'add_circle' : ''" @click:append="addNewItem"></v-text-field>
						</v-flex>

						<v-flex xs12>
							<template v-if="dataArr.length == 0">
								<v-alert type="warning" :value="true">
									No data found
								</v-alert>
							</template>
							<template>
								<v-layout row wrap>
									<v-flex xs12 v-for="item in dataArr" :key="item.id">
										<v-layout row wrap>
											<v-flex class="grow">
												<v-text-field single-line v-model="item.title" :append-icon="(item.title) ? 'save': ''"  @click:append="updateItem(item)"></v-text-field>
											</v-flex>
											<v-flex class="shrink pa-1">
												<v-switch v-model="item.del" :label="`Currently ${(!item.del) ? 'active' : 'inactive'}`" @change="updateItem(item)"></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</template>
						</v-flex>
					</v-layout>
				</v-card-text>
			</v-card>
		</v-flex>
	</v-layout>
</template>

<script>
const loader = () => import('../Loader');

export default {
	data(){
		return {
			dataArr: [],
			loading: false,
			newItem: null
		}
	},
	components:{
		loader
	},
	computed:{
		// Set Page DB settings based on props
		PgType(){
			return this.pgType;
		},

		// Title
		PgTitle(){
			// Get all child routes from router settings child's
			let {name} = this.$route;
			name = name.split('.').pop().replace(/\b\w/g, l => l.toUpperCase()).replace(/_/g, ' ');

			return name;
		},

		// Master doc
		MasterDoc(){
			const dbCol = this.PgType;
			return this.$__firebase.firestore.collection('settings').doc(this.$__firebase.fireauth.currentUser.uid).collection(dbCol);
			//return this.$__firebase.firestore.collection('master').doc('data').collection(dbCol); // Master data collection
		},
	},
	methods:{
		// Get master data
		getData(refresh = false){
			if(refresh) this.dataArr = [];

			this.loading = true;
			this.MasterDoc.orderBy('title', 'asc').get().then(snapShot => {
				if(!snapShot.empty){
					snapShot.forEach(doc => {
						const data = doc.data();
						data.id = doc.id;

						if(!this.dataArr.find(obj => obj.id === data.id)) this.dataArr.push(data);
					});
				}
				this.loading = false;
			}).catch(err => {
				this.loading = false;
				this.$store.commit('setSnackMsg', err.message);
			});
		},

		// Add new item
		addNewItem(){
			this.loading = true;
			const newItem = this.newItem;

			// Check if item already exist
			const itemExist = this.dataArr.find(obj => obj.title.toLowerCase() === newItem.toLowerCase());
			if(itemExist){
				this.$store.commit('setSnackMsg', 'Item already exists.');
				this.newItem = null;
				this.loading = false;
				return false;
			}

			const newItemDoc = this.MasterDoc.doc()
			newItemDoc.set({
				del: false,
				title: newItem
			}).then(result => {
				this.$store.commit('setSnackMsg', 'Item add success');
				this.newItem = null;
				this.getData();
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message)
			})
		},

		updateItem(item = false){
			if(!item) return false;

			const itemDoc = this.MasterDoc.doc(item.id);
			this.loading = true;
			itemDoc.set(item).then(result => {
				this.$store.commit('setSnackMsg', 'Item update success');
				this.getData();
				this.loading = false;
			}).catch(err => {
				this.$store.commit('setSnackMsg', err.message);
				this.loading = false;
			});
		}
	},
	mounted(){
		this.getData(true);
	},
	props:{
		pgType:{
			default: 'income_category'
		}
	}
}
</script>

<style>

</style>