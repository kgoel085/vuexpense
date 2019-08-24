<template>
    <v-layout row wrap>
        <v-flex xs12>
            <v-card tile>
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

                    <v-flex xs12 v-if="!loadingData && hasData">
                        <v-list-tile v-for="item in dataField" :key="item.id">
                            <v-list-tile-content>
                                <v-list-tile-title :class="(item.hasOwnProperty('delete') && item.delete == true) ? 'red--text strikethrough' : '' ">
                                    <span class="delText">{{ item.title }}</span>
                                </v-list-tile-title>
                            </v-list-tile-content>

                            <v-list-tile-action>
                                <v-flex xs12>
                                    <v-btn icon ripple class="ma-1" @click="emitUpdateData(item)">
                                        <v-icon color="grey lighten-1">edit</v-icon>
                                    </v-btn>
                                    <v-btn icon ripple class="ma-1" @click="emitDeleteData(item.id)">
                                        <v-icon color="grey lighten-1">delete</v-icon>
                                    </v-btn>
                                </v-flex>
                                
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-flex>
                    <v-flex xs12 v-else>
                        <loader v-if="loadingData"></loader>
                        <v-alert :value="true" type="info" v-else class="ma-2"> No data found </v-alert>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
import EventBus from '../../../helpers/EventBus';

const loader = () => import('@/components/Loader');

export default {
    data(){
        return {
            // Stores reminder data
            dataField:[],

            // Apply filters to data
            filters:[
                {name: 'All', value: 0}, 	// Show all records
                {name: 'Active', value: 1}, 	// Show active records only
                {name: 'Deleted', value: 2}		// Show deleted records only
            ],

            // A loader identifier
            loadingData: false,

            // Which records to show
            showRecords: 0,

            // Update listener
            updateListener: false
        }
    },
    watch:{
        // Check if data is there, and loading is still on, then stop it
        hasData(val){
            if(val && this.loadingData) this.loadingData = false;
        },

        // Refresh data for filters
        showRecords(val){
            this.getData(true);
        }
    },
    computed:{
        // User auth object
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        },

        // Current selected date
        expenseDate(){
            return this.$store.state.home.currentDate;
        },

        // Check whether any data is available or not
        hasData(){
            return (this.dataField.length > 0) ? true : false;
        }
    },
    methods:{
        // User reminder document
        reminderDoc(filter = true){

            // Return the document instance, if available
            if(this.userObj){
                // Date order
                let dtArr = ['year', 'month', 'date'];

                // Apply filter
                let doc = this.$__firebase.firestore.collection('reminders').doc(this.userObj.uid).collection('data');

                // If filter is required, only then apply it
                if(filter){
                    this.expenseDate.split('-').forEach((key, indx) => doc = doc.where(dtArr[indx], '==', parseInt(key)));

                    // Record type filter ( Active , Deleted )
                    switch(this.showRecords){
                        // Show active records only
                        case 1:
                            doc = doc.where('delete', '==', false);
                        break;

                        // Show deleted records only
                        case 2:
                            doc = doc.where('delete', '==', true);
                        break;
                    }
                }
                return doc;
            }
            return false;
        },

        // Get reminders data
        getData(refresh = false){
            this.loadingData = true;
            if(!this.reminderDoc()) return false;

            // If refresh is called, reset the current data
            if(refresh) this.dataField = [];

            this.reminderDoc().get().then(snapShot => {
                snapShot.forEach(doc => {
                    if(doc.exists){
                        let data = doc.data();
                        data['id'] = doc['id'];

                        this.createData(data);
                    }
                });

                this.loadingData = false;
            });
        },

        // Listen for real time updates
        updateData(){
            if(!this.reminderDoc()) return false;
            this.updateListener = this.reminderDoc().onSnapshot(snapshot => {
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

        // create data interface
        createData(data = false){
            if(!data) return false;

            // Check whether same document exists or not
            if(data.hasOwnProperty('id') && data.id) this.checkData(data.id);

            // Push data to main object
            this.dataField.push(data);
        },

        // Check data 
        checkData(id = false){
            if(!id) return false;

            const [found] = this.dataField.map((el, indx) => {
                if(el.id == id) return indx;
                else return false;
            });

            if(found === false) return false;

            // Delete the received index
            this.$delete(this.dataField, found);
        },

        // Emit Updated data
        emitUpdateData(data = false){
            if(data) EventBus.$emit('update-db-data', data);
        },

        // Emit delete data
        emitDeleteData(id = false){
            if(id) EventBus.$emit('delete-db-data', {doc: this.reminderDoc(false), id: id});
        }
    },
    mounted(){
        // Get data first time
        this.getData();

        // Bind update listener
        this.updateData();

        // Event listener for date changed
        EventBus.$on('date-changed', date => this.getData(true));
    },
    beforeDestroy(){
        // Destroy the listener
        if(this.updateListener && typeof this.updateListener == 'function') this.updateListener();
    },
    components:{
        loader
    },
    props:{
        // Disable elements if parent says so
        disableElem:{
            default: false,
            type: Boolean
        }
    }
}
</script>

<style>

</style>
