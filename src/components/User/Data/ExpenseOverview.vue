<template>
    <v-layout row wrap :key="currentDate">
        <v-flex xs12 class="pa-0">
            <v-card flat >
                <v-card-title class="pa-0">
                    <v-list class="grow">
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-title class="primary--text autoHeight">
                                    <v-select
                                        :items="[{name: 'Month Overview', value: 0}, {name: 'Day Overview', value: 1}]"
                                        v-model="currentOverview"
                                        item-text="name"
                                        item-value="value"
                                        solo
                                    ></v-select>
                                </v-list-tile-title>
                            </v-list-tile-content>

                            <v-list-tile-action>
                                <v-btn @click="showOverview = !showOverview">
                                    <v-btn outline color="primary" :loading="loading">
                                        <v-icon left>local_atm</v-icon> <span right> {{ monthTotal }} </span>
                                    </v-btn>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                </v-card-title>

                <v-slide-y-transition>
                    <v-card-text v-if="showOverview">
                        <v-layout row wrap>
                            <v-flex class="grow pa-1" v-for="(mData, type) in overviewObj" :key="mData.color">
                                <v-menu open-on-hover top offset-y>
                                    <template v-slot:activator="{ on }">
                                        <v-card tile hover class="pa-2" v-on="(mData.data.length > 1) ? on : false">
                                            <v-list-tile>
                                                <v-list-tile-avatar>
                                                    <v-icon :size="40" :color="mData.color">{{ mData.icon }}</v-icon>
                                                </v-list-tile-avatar>

                                                <v-list-tile-content>
                                                    <v-list-tile-title left>
                                                        <small class="grey--text text-capitalize">{{type}} </small> <span class="font-weight-medium px-4"> {{ mData.total }} </span>
                                                    </v-list-tile-title>
                                                </v-list-tile-content>
                                            </v-list-tile>
                                        </v-card>
                                    </template>
                                    
                                    <!-- Tooltip content -->
                                    <v-card flat tile>
                                        <v-card-title class="pa-2">
                                            <h3>Last 5 entries</h3>
                                        </v-card-title>
                                        <v-card-text class="pa-1">
                                            <template v-for="(data, indx) in mData.data">
                                                <v-list-tile :key="data.id" class="pa-1">
                                                    <v-list-tile-content>
                                                        <v-list-tile-title v-html="data.title"></v-list-tile-title>
                                                        <v-list-tile-sub-title class="grey--text darken-4" v-html="data.value"></v-list-tile-sub-title>
                                                    </v-list-tile-content>
                                                </v-list-tile>

                                                <v-divider :key="indx" v-if="indx < mData.data.length - 1"></v-divider>
                                            </template>
                                        </v-card-text>

                                        <v-card-actions v-if="mData.hasOwnProperty('moreData') && mData.moreData">
                                            <v-layout row wrap>
                                                <v-flex xs12 class="text-xs-center">
                                                    <v-btn flat class="primary">More Data</v-btn>
                                                </v-flex>
                                            </v-layout>
                                        </v-card-actions>
                                    </v-card>
                                </v-menu>
                                
                            </v-flex>
                            <v-flex class="grow pa-1">
                                <v-card tile hover class="pa-2">
                                    <v-list-tile>
                                        <v-list-tile-avatar>
                                            <v-icon :size="40" color="secondary">local_atm</v-icon>
                                        </v-list-tile-avatar>

                                        <v-list-tile-content>
                                            <v-list-tile-title left>
                                                <small class="grey--text text-capitalize">Difference </small> <span class="font-weight-medium px-4"> {{ monthTotal }} </span>
                                            </v-list-tile-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-slide-y-transition>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
// Modules
import EventBus from '../../../helpers/EventBus';

export default {
    data(){
        return {
            // Loading state
            loading: false,

            // Which overview type to show
            currentOverview: 0,

            // Show detailed overview
            showOverview: false,

            // Month data analysis
            monthData: {
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
            }
        }
    },
    computed:{
        // Returns the current date
        currentDate(){
            return this.$store.state.home.currentDate;
        },

        // Check whether current month has any data or not
        monthTotal(){
            return this.monthData.credit.total - this.monthData.debit.total;
        },

        // Overview data
        overviewObj(){
            for(let key of Object.keys(this.monthData)){
                let obj = this.monthData[key];

                // Return only last 5 records
                if(obj.hasOwnProperty('data') && obj.data.length > 5){
                    obj.data = obj.data.slice(1).slice(-5);
                    obj.moreData = true;
                }
            }
            return this.monthData;
        },

        // User object
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        }
    },
    watch:{
        currentOverview(val){
            // Trigger data update
            this.getMonthlyData();
        }
    },
    methods:{
        // DB document
        doc(){
            if(!this.userObj) return false;

            let doc = this.$__firebase.firestore.collection('expenses').doc(this.userObj.uid).collection('data');
            const [year, month, date] = this.currentDate.split('-');

            if(year) doc = doc.where('year', '==', parseInt(year));
            if(month) doc = doc.where('month', '==', parseInt(month));

            // IF single day overview is requested
            if(this.currentOverview == 1 && parseInt(date)) doc = doc.where('date', '==', parseInt(date));

            return doc;
        },

        // Get monthly data
        getMonthlyData(){
            if(!this.doc()) return false;
            this.loading = true;

            this.doc().get().then(snapshot => {
                Object.keys(this.monthData).forEach(key => {
                    let obj = this.monthData[key];
                    obj.data = [];
                    obj.total = 0;
                });

                snapshot.forEach(doc => {
                    if(doc.exists){
                        let data = doc.data();
                        data['id'] = doc.id;
                        
                        // Store the month data
                        this.createData(data);
                    }
                });

                this.loading = false;
            });
        },

        // Check data for duplicate entries
        checkData(id = false){
            if(!id || !this.hasData) return false;

            let defaultObj = this.monthData;
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
        createData(obj = false){
            if(obj){
                let defaultObj = this.monthData;

                // Check whether same document exists or not
                if(obj.hasOwnProperty('id') && obj.id) this.checkData(obj.id);

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
                            });
                        }
                    }
                }
            }
        }
    },
    mounted(){
        // Get monthly data
        this.getMonthlyData();

        // Update event listener
        EventBus.$on('update-overview-data', this.getMonthlyData);
    },
    beforeDestroy(){
        EventBus.$off('update-overview-data');
    }
}
</script>

<style scoped>
    .autoHeight{
        height: auto !important;
    }
</style>
