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
                
            </template>
        </v-flex>
    </v-layout>
</template>

<script>
// Modules
import EventBus from '../../helpers/EventBus';

export default {
    data(){
        return {
            // Tab navigation
            tabNav:[
                {'title': 'Expenses', component: 'ViewExpanse', doc: 'expenses'},
                {'title': 'Reminders', component: 'ViewReminder', doc: 'reminders', excludeFields: ['type', 'value']}
            ],

            // Current tab selected
            currentTab: 0
        }
    },
    watch:{
        // Listen for tab changes
        userComponent(val){
            EventBus.$emit('set-tab', this.currentTab);
            EventBus.$emit('set-tab-data', this.tabNav[this.currentTab]);
        }
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
