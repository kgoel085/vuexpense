<template>
    <v-container>
        <v-layout row wrap v-if="userData">
            <!-- If user is new, show the notice popup -->
            <v-flex xs12 v-if="userData.hasOwnProperty('newUser')">
                <v-alert :value="true" type="info" dismissible transition="scale-transition">
                    Welcome {{ (currentUser.displayName) ? currentUser.displayName : 'User' }}, This setup is a one time mandatory process.<br>
                    <small>User modifications will be available. Once process is completed</small>
                </v-alert>
            </v-flex>

            <v-layout row wrap>
                <v-flex xs12>
                     <!-- User related steppers -->
                    <v-stepper v-model="currentStep" non-linear>
                        <!-- Stepper Header -->
                        <v-stepper-header>
                            <template v-for="(step, indx) in stepper.header">
                                <v-stepper-step :complete="step.complete" :step="indx+1" :key="`${step.title}_${indx+1}`">{{ step.title }}</v-stepper-step>
                                <v-divider :key="`${step.title}_${indx+22}`"></v-divider>
                            </template>
                        </v-stepper-header>

                        <!-- Stepper Items -->
                        <v-stepper-items>
                            <v-stepper-content v-for="(step, indx) in stepper.header" :step="indx+1" :key="indx" class="pa-0 ma-0">
                                <!-- Pass current user and related document -->
                                <component v-if="step.hasOwnProperty('component')" :is="step.component" :user="currentUser" :doc="userData" @updateData="updateUser" @updateStepper="updateStep" @blockUpdate="updateStep"></component>
                            </v-stepper-content>
                        </v-stepper-items>
                    </v-stepper>
                </v-flex>
            </v-layout>
        </v-layout>
        <loader v-else></loader>
    </v-container>
</template>

<script>
import loader from '@/components/Loader'
import UserDetails from '@/components/User/Details'

export default {
    data(){
        return {
            // User related data
            userData: false,
            currentUser: this.$__firebase.fireauth.currentUser,

            // Manage current stepper
            currentStep: 0,
            proceedToNextStep: true,
            stepper:{
                header: [
                    {title: 'Details', completed: false, component: 'UserDetails'},
                    {title: 'Finalize', completed: false},
                ]
            }
        }
    },
    components:{
        loader,
        UserDetails
    },
    methods:{
        // Get current user data document
        getData(){
            let userId = this.currentUser.uid;
            this.$__firebase.firestore.collection('users').doc(userId).get().then(doc => {
                if(doc.exists){
                    this.userData = doc.data();
                    // Record the user last visit time
                    if(!this.userData.hasOwnProperty('last_user_visit')){
                        this.userData['last_user_visit'] = new Date().toISOString();
                        this.userData['prev_last_user_visit'] = false;
                    }else{
                        // Store the last user visit time from current one
                        let prevDate = this.userData['last_user_visit'];
                        if(!this.userData.hasOwnProperty('prev_last_user_visit')) this.userData['prev_last_user_visit'] = prevDate;
                        this.userData['last_user_visit'] = new Date().toISOString();
                    }
                }
            }).catch(err => {
                this.$store.commit('setSnackMsg', err.message);
            });
        },

        // Update user requested data
        updateUser(key, ...args){
            console.log(key, args);
        },

        // Update current stepper
        updateStep(key, val){
            switch(key){
                case 'StepProceed':
                    this.proceedToNextStep = val
                break;
            }
        }
    },
    mounted(){
        this.getData();
    }
}
</script>

<style>
    .stepper__header .divider{
        margin: 0 -16px;
    }
</style>
