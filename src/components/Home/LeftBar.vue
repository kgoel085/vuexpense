<template>
    <v-layout>
        <v-flex xs12>
            <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
            >
                <template v-slot:activator="{ on }">
                    <v-text-field
                        v-model="currentDate"
                        label="Select Date"
                        prepend-icon="event"
                        readonly
                        v-on="on"
                        @click:append-outer="showPicker = !showPicker"
                    >
                        <!-- Tooltip for appended icon -->
                        <template v-slot:append-outer>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on" @click="showPicker = !showPicker">{{ (showPicker) ? 'expand_less' : 'expand_more'  }}</v-icon>
                                </template>
                                See data overview
                            </v-tooltip>
                        </template>
                    
                    </v-text-field>
                </template>
                <v-date-picker v-model="currentDate" :disabled="disableCalender" scrollable :events="dataPointers"></v-date-picker>
            </v-menu>

            <!-- Show big picker if selected by user -->
            <v-slide-y-transition>
                <v-date-picker width="100%" :reactive="true" v-model="currentDate" v-if="showPicker" :disabled="disableCalender" :events="dataPointers"></v-date-picker>
            </v-slide-y-transition>

            <!-- Add / Update Data -->
            <ManageData 
                :key="currentTab"
                :date="currentDate" 
                :saveDoc="tabConfig.doc" 
                :updateObj="updateObj" 
                :excludeFields="(tabConfig.hasOwnProperty('excludeFields') && tabConfig.excludeFields.length > 0) ? tabConfig.excludeFields : []"
            ></ManageData>
        </v-flex>
    </v-layout>
</template>

<script>
// Modules
import EventBus from '../../helpers/EventBus';

// Components
const ManageData = () => import('@/components/User/Data/ManageData');

export default {
    data(){
        return {
            // Date picker menu
            menu: false,

            // Show bigger date picker
            showPicker: false,

            // Stores the current month data points for picker
            dataPointers: [],

            // Stores the current active date
            currentDate: false,

            // Update data
            updateObj: {}
        }
    },
    computed:{
        // Calender is disabled or not
        disableCalender(){
            return (this.$store.state.home.disableElements) ? this.$store.state.home.disableElements : false;
        },

        // Sets the current date
        selectedDate:{
            get(){
                // Check whether any date is already set ot not
                let date = (this.$store.state.home.currentDate) ? this.$store.state.home.currentDate : new Date().toISOString().substr(0, 10);
                return date;
            },
            set(val){
                // Set the new date
                this.currentDate = val;
            }
        },

        // Current tab
        currentTab(){
            return this.$store.state.home.currentTab;
        },

        // Current tab configuration
        tabConfig(){
            return this.$store.state.home.tabData;
        }
    },
    watch:{
        // Listen for new date & emit it
        currentDate(val){

            // Also emit the new changed value
            EventBus.$emit('date-changed', val);
        }
    },
    components:{
        ManageData
    },
    mounted(){
        // Sets the current date based on the stored values 
        this.currentDate = this.selectedDate;

        // Emit the current date
        EventBus.$emit('date-changed', this.currentDate);

        // Reset update object
        EventBus.$on('reset-update', () => {this.updateObj = {}});

        // Set update object data
        EventBus.$on('update-db-data', data => this.updateObj = data);
    },
    beforeDestroy(){
        EventBus.$off(['date-changed', 'reset-update', 'update-db-data']);
    }
}
</script>

<style>

</style>
