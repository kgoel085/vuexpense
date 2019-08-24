<template>
    <v-layout row wrap>
        <v-flex xs12>
            <v-card flat>
                <v-layout row wrap>
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

                    <!-- Monthly / Daily overview -->
                    <v-flex xs12>
                        <ExpenseOverview></ExpenseOverview>
                    </v-flex>

                    <!-- Show fetched data -->
                    <v-flex xs12 v-if="!loadingData && hasData" class="pa-1">
                        <div class="d-flex justify-between align-center mb-1">
                            <v-btn @click="expandPanel = !expandPanel">{{ (expandPanel) ? 'Collapse' : 'Expand' }}</v-btn>
                        </div>

                        <v-expansion-panel v-model="panel" expand popout focusable :disabled="disableElem">
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
                                                <v-tooltip bottom>
                                                    <template v-slot:activator="{ on }">
                                                        <span class="delText text-truncate" v-on="on">{{ ($vuetify.breakpoint.smAndDown) ? data.title.substr(0, 20)+'...' : data.title }}</span>
                                                    </template>
                                                    <span>{{ data.title }}</span>
                                                </v-tooltip>
                                            </v-list-tile-title>
                                        </v-list-tile-content>

                                        <v-list-tile-action>
                                            <span>
                                                <span class="delText">{{ data.value }}</span>
                                                <v-btn small icon class="ma-2" @click="emitUpdateData(data)">
                                                    <v-icon size="20" class="px-2">edit</v-icon>
                                                </v-btn>

                                                <v-btn small icon class="ma-2" @click="emitDeleteData(data.id)">
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
                        <Loader v-if="loadingData"></Loader>
                        <v-alert :value="true" type="info" v-else> No expense data found </v-alert>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
// Modules
import EventBus from '../../../helpers/EventBus';

// Components
const Loader = () => import('@/components/Loader');
const ExpenseOverview = () => import('@/components/User/Data/ExpenseOverview');

export default {
    data(){
        return {
            // Stores the current expense data 
            userData: {
                debit: {
                    data: [],
                    total: 0,
                    color: 'red',
                    icon: 'money_off'
                },
                credit: {
                    data: [],
                    total: 0,
                    color: 'success',
                    icon: 'attach_money'
                }
            },

            // Apply filters to data
            filters:[
                {name: 'All', value: 0}, 	// Show all records
                {name: 'Active', value: 1}, 	// Show active records only
                {name: 'Deleted', value: 2}		// Show deleted records only
            ],

             // Which records to show
            showRecords: 0,

            // A loader identifier
            loadingData: false,

            // Current expansion panel
            panel: [],

            // make expansion panels extended / collapsed
            expandPanel: false,

            // Update listener
            updateListener: false
        }
    },
    watch:{
        // Emit update events when date is changed
        expenseDate(val){
            EventBus.$emit('update-overview-data', val);
        },

        // Manage the expand / collapse of divs
        expandPanel(val){
            // Expand all
            if(val) this.panel = [...Object.keys(this.userData)].map(_ => true)
            // Close all
            else this.panel = []; 
        },

        // Get new data for new filter
        showRecords(val){
            this.getData(true);
        }
    },
    computed:{
        // Current selected date
        expenseDate(){
            return this.$store.state.home.currentDate;
        },

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
            this.loadingData = false;
            return false;
        },

        // Disable elements
        disableElem(){
            return this.$store.state.home.disableElements;
        }
    },
    methods:{
        // User expense document
        expenseDoc(filter = true, dateFilter = false, enableRecordFilter = true){

            // Return the document instance, if available
            if(this.userObj){
                // Date order
                let dtArr = ['year', 'month', 'date'];

                // Overwrite the default applied filters for the document, expects array with keys of filter to apply
                if(dateFilter && typeof dateFilter == 'object'){
                    dtArr = dtArr.filter(val => {
                        if(dateFilter.includes(val)) return val;
                    });
                }

                // Apply filter
                let expenseDoc = this.$__firebase.firestore.collection('expenses').doc(this.userObj.uid).collection('data');

                // If filter is required, only then apply it
                if(filter){
                    this.expenseDate.split('-').forEach((key, indx) => {
                        if(dtArr.hasOwnProperty(indx)) expenseDoc = expenseDoc.where(dtArr[indx], '==', parseInt(key))
                    });

                    if(enableRecordFilter){
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
                }

                return expenseDoc;
            }

            return false;
        },

        // Get the current date data
        getData(refresh = false){
            this.loadingData = true;
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
        checkData(id = false, parentObj = false){
            if(!id || !this.hasData) return false;

            let defaultObj = (!parentObj) ? this.userData : parentObj;
            let keys = Object.keys(defaultObj);

            for(let key of keys){
                let obj = (defaultObj.hasOwnProperty(key) && defaultObj[key].data.length > 0) ? defaultObj[key].data : false;
                if(obj){
                    obj.forEach((elem, indx) => {
                        // If id already exists, remove that before adding it on the interface 
                        if(elem.id == id){
                            // Also subtract the total value
                            defaultObj[key].total -= parseInt(elem.value);
                            this.$delete(defaultObj[key].data, indx);
                        }
                    });
                }
            }
            return false;
        },

        // Creates the data for the interface
        createData(obj = false, parentObj = false){
            if(obj){
                let defaultObj = (!parentObj) ? this.userData : parentObj;

                // Check whether same document exists or not
                if(obj.hasOwnProperty('id') && obj.id) this.checkData(obj.id, parentObj);

                // Check if current value type exists or not 
                if(obj.hasOwnProperty('type') && defaultObj.hasOwnProperty(obj.type)){

                    let mainObj = defaultObj[obj.type];

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

            this.updateListener = this.expenseDoc().onSnapshot(snapshot => {
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

            // Bind update method again
            this.updateData();
        },

        // Emit Updated data
        emitUpdateData(data = false){
            if(data) EventBus.$emit('update-db-data', data);
        },

        // Emit delete data
        emitDeleteData(id = false){
            if(id) EventBus.$emit('delete-db-data', {doc: this.expenseDoc(false), id: id});
        }
    },
    mounted(){
        // Get actual data
        this.getData();

        // Listen for real time updates
        this.updateData();

        // Event Listeners

            //  Date changed, refresh data 
            EventBus.$on('date-changed', date => {if(date) this.getData(true);});
    },
    beforeDestroy(){
        if(this.updateListener && typeof this.updateListener == 'function') this.updateListener();
        EventBus.$off('date-changed');
    },
    components:{
        Loader,
        ExpenseOverview
    }
}
</script>

<style>

</style>
