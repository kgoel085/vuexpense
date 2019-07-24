<template>
    <v-layout row wrap class="userDetails">
        <v-flex xs12 class="pa-0 ma-0">
            <v-card flat tile class="grow">
                <!-- User Profile -->
                <v-card-title>
                    <v-list-tile class="grow">
                        <v-layout row wrap justify-start align-center>
                            
                            <v-list-tile-avatar color="grey darken-3" size="100">
                                <v-img class="elevation-6" :src="UserPhoto"></v-img>
                            </v-list-tile-avatar>

                            <v-list-tile-content class="px-4">
                                <v-list-tile-title class="font-weight-medium font-italic">
                                    {{ ( UserObj.displayName ) ? UserObj.displayName : 'User' }}
                                </v-list-tile-title>
                            </v-list-tile-content>
                        </v-layout>
                    </v-list-tile>
                </v-card-title>

                <!-- User data fields -->
                <v-card-text class="pa-4">
                    <v-layout row wap>
                        <v-flex xs4 v-for="(input, indx) in dataCols.input" :key="indx" class="pa-2">
                            <v-text-field :label="input.title" :placeholder="input.title" v-model="input.value"></v-text-field>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
export default {
    data(){
        return {
            
        }
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

        // All the below fields are taken from here :
        // https://firebase.google.com/docs/reference/js/firebase.User
        dataCols(){
            let returnObj = false;
            if(this.UserObj){
                returnObj = {
                    // Input data fields
                    input:{
                        displayName: {title: 'Display Name', value: (this.UserObj.displayName) ? this.UserObj.displayName : 'User'},
                        email: {title: 'Email', value: this.UserObj.email},
                        phoneNumber: {title: 'Phone Number', value: this.UserObj.phoneNumber},
                    },

                    // Status data fields
                    switch:{
                        emailVerifeid: {title: 'Email Verified', value: false},
                        isAnonymous: {title: 'Is Anonymous', value: true}, 
                    }
                }
            }

            return returnObj;
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
