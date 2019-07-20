<template>
    <v-form ref="loginForm" v-model="formData.valid">
        <v-container>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-text-field autofocus label="Username" v-model="formData.username.value" :counter="10" :rules="formData.username.rules"></v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field label="Email" v-model="formData.email.value" :rules="formData.email.rules"></v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-layout row wrap>
                        <v-flex xs12 sm6 md6 lg6 xl6 class="pa-1">
                            <v-text-field :type="formData.password.showPass ? 'text' : 'password'" label="Password" v-model="formData.password.value" :rules="formData.password.rules" @click:append="formData.password.showPass = !formData.password.showPass" :append-icon="formData.password.showPass ? 'visibility' : 'visibility_off'"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md6 lg6 xl6 class="pa-1">
                            <v-text-field :type="formData.confirmPassword.showPass ? 'text' : 'password'" label="Confirm Password" v-model="formData.confirmPassword.value" :rules="formData.confirmPassword.rules" @click:append="formData.confirmPassword.showPass = !formData.confirmPassword.showPass" :append-icon="formData.confirmPassword.showPass ? 'visibility' : 'visibility_off'"></v-text-field>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs12 class="text-xs-center">
                    <v-btn flat @click="valdiate" class="secondary">Login</v-btn>
                </v-flex>
            </v-layout>
        </v-container>
    </v-form>
</template>

<script>
export default {
    data(){
        return{
            formData:{
                username: {
                    value: null, 
                    rules:[
                        v => !!v || 'Name is required',
                        v => (v && v.length <= 10) || 'Name must be less than 10 characters'
                    ]
                },
                email: {
                    value: null, 
                    rules:[
                        v => !!v || 'E-mail is required',
                        v => /.+@.+/.test(v) || 'E-mail must be valid'
                    ]
                },
                password: {
                    value: null,
                    showPass: false, 
                    rules:[
                        v => !!v || 'Password is required'
                    ]
                },
                confirmPassword: {
                    value: null, 
                    showPass: false,
                    rules:[
                        v => (!!v && v) === this.formData.password.value || 'Password does not matches'
                    ]
                },
                valid: false
            }
        }
    },
    methods:{
        valdiate(){
            console.log(this.formData);
        }
    }
}
</script>

<style>

</style>
