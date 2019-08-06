<template>
    <v-layout row wrap>
        <v-flex xs12>
            <v-card flat>
                <v-layout row wrap :key="updateView">
                    <!-- Data filter -->
                    <v-flex xs12>
                        <v-select class="shrink pa-2 mt-4"
                            :items="filters"
                            label="Show Records"
                            v-model="showRecords"
                            item-text="name"
                            item-value="value"
                        ></v-select>
                    </v-flex>

                    <!-- Show fetched data -->
                    <v-flex xs12 v-if="!loadingData && hasData">
                        <div class="d-flex justify-between align-center mb-1">
                            <v-btn @click="expandPanel = !expandPanel">{{ (expandPanel) ? 'Collapse' : 'Expand' }}</v-btn>
                        </div>
                        <v-expansion-panel v-model="panel" expand popout focusable :key="$store.state.global.updateView" :disabled="disableElem">
                            <v-expansion-panel-content v-for="(type, indx) in userData" :key="indx">
                                <template v-slot:header>
                                    <v-layout row wrap class="text-capitalize">
                                        <v-flex class="grow" :class="type.color+'--text'">
                                            <span>{{ indx }}</span>
                                        </v-flex>
                                        <v-flex class="shrink" :class="type.color+'--text'">
                                            <small>Total:</small>	  <strong>{{ type.total }}</strong>
                                        </v-flex>
                                    </v-layout>
                                </template>
                                <v-alert :value="true" type="info" v-if="type.data.length == 0" class="ma-2"> No expense data found </v-alert>
                                <v-card v-else>
                                    <v-list-tile v-for="(data,indx) in type.data" :key="indx" :class="(data.hasOwnProperty('delete') && data.delete == true) ? 'red--text strikethrough' : '' ">
                                        <v-list-tile-content>
                                            <v-list-tile-title>
                                                <span class="delText">{{ data.title }}</span> 
                                            </v-list-tile-title>
                                        </v-list-tile-content>

                                        <v-list-tile-action>
                                            <span>
                                                <span class="delText">{{ data.value }}</span>
                                                <v-btn small icon class="ma-2" @click="$emit('update-row', data)">
                                                    <v-icon size="20" class="px-2">edit</v-icon>
                                                </v-btn>

                                                <v-btn small icon class="ma-2" @click="$emit('confirm-delete', expenseDoc(false), data.id)">
                                                    <v-icon size="20" class="px-2">
                                                        {{ (data.hasOwnProperty('delete') && data.delete == true) ?'restore' : 'delete' }}
                                                    </v-icon>
                                                </v-btn>
                                            </span>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-flex>
                    <v-flex xs12 v-else>
                        <loader v-if="loadingData"></loader>
                        <v-alert :value="true" type="info" v-else> No expense data found </v-alert>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
const loader = () => import('@/components/Loader')

export default {
    data(){
        return {
            // Stores the current expense data 
            userData: {
                debit: {
                    data: [],
                    total: 0,
                    color: 'red'
                },
                credit: {
                    data: [],
                    total: 0,
                    color: 'success'
                }
            },

            // Apply filters to data
            filters:[
                {name: 'All', value: 0}, 	// Show all records
                {name: 'Active', value: 1}, 	// Show active records only
                {name: 'Deleted', value: 2}		// Show deleted records only
            ],

            // A loader identifier
            loadingData: false,

            // Current expansion panel
            panel: [],

            // make expansion panels extended / collapsed
            expandPanel: false,

            // Which records to show
            showRecords: 1
        }
    },
    components:{
        loader
    },
    watch:{
        // Reset everything if date is changed
        expenseDate(val){
            this.loadingData = true;
            if(val){
                // Reset main object
                this.resetData();

                // Get data for current selected date
                this.getData();
            }
        },

        // Manage the expand / collapse of divs
        expandPanel(val){
            // Expand all
            if(val) this.panel = [...Object.keys(this.userData)].map(_ => true)
            // Close all
            else this.panel = []; 
        },

        // Trigger new data whenever a new record type is requested
        showRecords(val){
            this.getData(true);
        }
    },
    computed:{
        // Current user object
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        },

        // Check whether any data is there or not
        hasData(){
            this.loadingData = true;
            if(this.userData.debit.data.length > 0 || this.userData.credit.data.length > 0){
                this.loadingData = false;
                return true;
            }
            this.loadingData = true;
            return false;
        }
    },
    methods:{
        // User expense document
        expenseDoc(filter = true){

            // Return the document instance, if available
            if(this.userObj){
                // Date order
                let dtArr = ['year', 'month', 'date'];

                // Apply filter
                let expenseDoc = this.$__firebase.firestore.collection('expenses').doc(this.userObj.uid).collection('data');

                // If filter is required, only then apply it
                if(filter){
                    this.expenseDate.split('-').forEach((key, indx) => expenseDoc = expenseDoc.where(dtArr[indx], '==', parseInt(key)));

                    // Record type filter ( Active , Deleted )
                    switch(this.showRecords){
                        // Show active records only
                        case 1:
                            expenseDoc = expenseDoc.where('delete', '==', false);
                        break;

                        // Show deleted records only
                        case 2:
                            expenseDoc = expenseDoc.where('delete', '==', true);
                        break;
                        
                    }
                }

                return expenseDoc;
            }

            return false;
        },

        // Reset the user data
        resetData(){
            // Reset main object
            Object.keys(this.userData).forEach(key => {
                let obj = this.userData[key];
                obj.data = [];
                obj.total = 0;
            });

            // Reset expanded panel
            this.expandPanel = false;

            // Reset update object
            this.rowUpdate = {};

            // Bind update method again
            this.updateData();
        },

        // Get the current date data
        getData(refresh = false){
            if(!this.expenseDoc()) return false;
            if(refresh === true) this.resetData();

            // Get data
            this.expenseDoc().get().then(snapShot => {
                snapShot.forEach(doc => {
                    if(doc.exists){
                        // Extract data
                        let data = doc.data();
                        if(doc.id) data['id'] = doc.id;

                        // Add data to interface
                        this.createData(data);
                    }
                });

                this.loadingData = false;
            });
        },

        // Check data for duplicate entries
        checkData(id = false){
            if(!id || !this.hasData) return false;

            let keys = Object.keys(this.userData);

            for(let key of keys){
                let obj = (this.userData.hasOwnProperty(key) && this.userData[key].data.length > 0) ? this.userData[key].data : false;
                if(obj){
                    obj.forEach((elem, indx) => {
                        // If id already exists, remove that before adding it on the interface 
                        if(elem.id == id){
                            // Also subtract the total value
                            this.userData[key].total -= parseInt(elem.value);
                            this.$delete(this.userData[key].data, indx);
                        }
                    });
                }
            }
            return false;
        },

        // Creates the data for the interface
        createData(obj = false){
            if(obj){
                // Check whether same document exists or not
                if(obj.hasOwnProperty('id') && obj.id) this.checkData(obj.id);

                // Check if current value type exists or not 
                if(obj.hasOwnProperty('type') && this.userData.hasOwnProperty(obj.type)){

                    let mainObj = this.userData[obj.type];

                    // Search whether same doc id already exist or not
                    const found = mainObj.data.some(el => el.id == obj.id);

                    if(obj.hasOwnProperty('value') && obj.value){
                        // Collect all the value in their resp. collections
                        if(!found){
                            mainObj.total += parseInt(obj.value);
                            mainObj.data.push(obj);
                        }else{
                            // Update the previous records
                            Object.keys(obj).forEach(key => {
                                if(mainObj.hasOwnProperty(key) && obj[key] != mainObj[key]) mainObj[key] = obj[key];
                            })
                        }
                    }
                }
            }
        },
        
        // Listen for real time updates
        updateData(){
            if(!this.expenseDoc()) return false;
            this.expenseDoc().onSnapshot(snapshot => {
                snapshot.forEach(doc => {
                    // Extract data
                    let data = doc.data();
                    if(doc.id) data['id'] = doc.id;
                    
                    // Add data to interface
                    this.createData(data);
                });
            }, function(err) {
                this.$store.commit('setSnackMsg', err.message)
            });
        }
    },
    mounted(){
        // Get actual data
        this.getData();

        // Listen for real time updates
        this.updateData();
    },
    props:{
        // Update the current view request from parent
        updateView:{
            default: 0,
            type: Number
        },

        // Perform actions for provided date data
        expenseDate:{
            default: new Date().toISOString().substr(0, 10),
        },

        // Disable elements if parent says so
        disableElem:{
            default: false,
            type: Boolean
        }
    }
}
</script>

<style scoped>
	.strikethrough .delText{text-decoration: line-through;}
</style>