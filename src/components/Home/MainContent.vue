<template>
    <v-layout row wrap>
        <v-flex xs12>
            <!-- Component Navigation -->
            <v-tabs v-model="currentTab" slider-color="secondary" fixed-tabs>
                <v-tab v-for="tab in tabNav" :key="tab.title" ripple>
                    {{ tab.title }}
                </v-tab>
            </v-tabs>
        </v-flex>
        <v-flex xs12 >
            <template v-if="!userComponent">
                <v-alert :value="true" type="info"> Nothing found...! </v-alert>
            </template>
            <template v-else>
                <keep-alive>
                    <Loader v-if="!currentDate"></Loader>
                    <component v-else :is="userComponent.component" :expenseDate="currentDate"></component>
                </keep-alive>
            </template>
        </v-flex>
    </v-layout>
</template>

<script>
// Modules
import EventBus from '../../helpers/EventBus';

// Components
const Loader = () => import('@/components/Loader');
const ViewExpense = () => import('@/components/User/Data/ViewExpense');
const ViewReminder = () => import('@/components/User/Data/ViewReminder');

export default {
    data(){
        return {
            // Tab navigation
            tabNav:[
                {'title': 'Expenses', component: 'ViewExpense', doc: 'expenses'},
                {'title': 'Reminders', component: 'ViewReminder', doc: 'reminders', excludeFields: ['type', 'value']}
            ],

            // Current tab selected
            currentTab: 0
        }
    },
    components:{
        Loader,
        ViewExpense,
        ViewReminder
    },
    computed:{
        // User component for current tab
        userComponent(){
            return (this.tabNav.hasOwnProperty(this.currentTab)) ? this.tabNav[this.currentTab] : false;
        },

        // Current Date
        currentDate(){
            return this.$store.state.home.currentDate;
        }
    },
    watch:{
        // Listen for tab changes
        userComponent(val){
            EventBus.$emit('set-tab', this.currentTab);
            EventBus.$emit('set-tab-data', this.tabNav[this.currentTab]);
        }
    },
    mounted(){
        // Set the component, if any value is stored
        this.currentTab = (this.$store.state.home.currentTab) ? this.$store.state.home.currentTab : 0;

        // Emit default component & configs
        EventBus.$emit('set-tab', this.currentTab);
        EventBus.$emit('set-tab-data', this.tabNav[this.currentTab]);
    }
}
</script>

<style>

</style>
