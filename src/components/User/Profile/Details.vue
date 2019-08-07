<template>
    <v-form v-model="validForm">
        <v-layout row wrap class="userDetails">
            <v-flex xs12 class="pa-0 ma-0">
                <v-card flat tile class="grow">
                    <!-- User Profile -->
                    <v-card-title>
                        <UserProfile @userProfileUpdated="setProfile"></UserProfile>
                    </v-card-title>

                    <!-- User data fields -->
                    <v-card-text class="pa-4">
                        <v-layout row wrap>
                            <v-flex class="grow pa-2" v-for="(input, indx) in dataCols.switch" :key="indx">
                                <v-checkbox
                                    :label="input.title"
                                    :value="input.value"
                                    disabled
                                ></v-checkbox>
                            </v-flex>
                        </v-layout>
                        <v-layout row wap>
                            <v-flex xs4 v-for="(input, indx) in dataCols.input" :key="indx" class="pa-2">
                                <v-text-field :label="input.title" focus :clearable="(!input.hasOwnProperty('readonly')) ? true : false" :readonly="(input.hasOwnProperty('readonly')) ? true : false" :placeholder="input.title" :required="(input.hasOwnProperty('required')) ? true : false" :rules="(input.hasOwnProperty('rules')) ? input.rules : []" v-model="input.value" @input="checkFields(indx)" v-if="!input.hasOwnProperty('display')"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                    <v-card-actions>
                        <v-layout row wrap>
                            <v-flex xs12 class="text-xs-center">
                                <v-btn :disabled="!dirtyVals || !validForm" flat class="primary" @click="updateUser">Update</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-form>
</template>

<script>
import UserProfile from '@/components/User/Profile/Profile'

export default {
    data(){
        return {
            validForm: false,

            // All the below fields are taken from here :
            // https://firebase.google.com/docs/reference/js/firebase.User
            dataCols:{
                input:{
                    displayName: {
                        title: 'Display Name', 
                        value: (this.user.displayName) ? this.user.displayName : '',
                        dirty: false,
                        required: true,
                        rules:[
                            v => !!v || 'Display Name is required',
                            v => v.length > 6 || 'Display Name must be less than 6 characters'
                        ]
                    },
                    email: {
                        title: 'Email', 
                        value: this.user.email,
                        dirty: false,
                        readonly: true,
                        required: true,
                        rules:[
                            v => !!v || 'Email is required',
                            v => /.+@.+/.test(v) || 'E-mail must be valid'
                        ]
                    },
                    phoneNumber: {
                        title: 'Phone Number',
                        value: this.user.phoneNumber,
                        dirty: false,
                        readonly: true
                    },
                    photoURL: {
                        dirty: false,
                        value: this.user.photoURL,
                        display:false
                    }
                },

                // Status data fields
                switch:{
                    emailVerifeid: {title: 'Email Verified', value: (this.user.emailVerifeid)  ? true : false},
                    isAnonymous: {title: 'Is Anonymous', value: (this.user.isAnonymous)  ? true : false}, 
                }
            }
        }
    },
    components:{
        UserProfile
    },
    computed:{
        // Current user object
        UserObj(){
            return this.user;
        },

        // Current user data document
        UserData(){
            return this.doc
        },

        // User photo
        UserPhoto(){
            return (this.UserObj.photoURL) ? this.UserObj.photoURL : this.$store.state.firebase.defaultProfile;
        },

        // Checks if any default loaded values are changed or not
        dirtyVals(){
            let returnVal = false;

            // Check whether any field is modified or not 
            Object.keys(this.dataCols.input).forEach(key => {
                let obj = this.dataCols.input[key];
                if(obj.hasOwnProperty('dirty') && obj.dirty) returnVal = true;
            });

            // Update whether to proceed for next step or not
            this.$emit('blockUpdate', 'StepProceed', !returnVal);

            return returnVal;
        }
    },
    methods:{
        // Checks whether fields are modified or not
        checkFields(fieldKey = false){
            if(!fieldKey) return false;

            let obj = (this.dataCols.input.hasOwnProperty(fieldKey)) ? this.dataCols.input[fieldKey] : false;
            if(obj){
                let newVal = obj.value;
                let oldVal = this.UserObj[fieldKey];

                // If values are not same, set field as dirty ( Modified )
                if(newVal && newVal !== oldVal) obj.dirty = true;
                else obj.dirty = false;
            }
        },

        // Update the user with new details
        updateUser(){
            let newObj = {};

            Object.keys(this.dataCols.input).forEach((input, field) => {
                let obj = this.dataCols.input[input];
                if(obj.dirty) newObj[input] = obj.value;
            });

            if(Object.keys(newObj).length > 0){
                this.UserObj.updateProfile(newObj).then(resp => {

                    // Update user data
                    this.$__firebase.firestore.collection('users').doc(this.UserObj.uid).update({
                        newUser: false,
                        lastUpdate: new Date().toISOString()
                    });

                    this.$emit('blockUpdate', 'StepProceed', true);
                    this.$store.commit('setSnackMsg', 'User updated');
                    this.$store.commit('setView');
                }).catch(err => {
                    this.$store.commit('setSnackMsg', err.message);
                });
            }
        },

        // Set user profile image
        setProfile(src){
            if(src){
                this.dataCols.input.photoURL.value = src;
                this.checkFields('photoURL');
            }
        }
    },
    props:{
        user: {
            default: {},
            type: Object
        },
        doc:{
            default: {},
            type: Object
        }
    }
}
</script>

<style>
    .userDetails .v-list__tile{
        height: auto !important
    }
</style>
