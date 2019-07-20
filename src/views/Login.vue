<template>
    <v-form ref="loginForm" v-model="formData.valid">
        <v-container fluid>
            <v-layout row wrap>
                <v-flex xs12>
                    <h1>Login</h1>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-text-field autofocus label="Username" v-model="formData.username.value" :counter="10" :rules="formData.username.rules"></v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field label="Email" v-model="formData.email.value" :rules="formData.email.rules"></v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field :type="formData.password.showPass ? 'text' : 'password'" label="Password" v-model="formData.password.value" :rules="formData.password.rules" @click:append="formData.password.showPass = !formData.password.showPass" :append-icon="formData.password.showPass ? 'visibility' : 'visibility_off'"></v-text-field>
                </v-flex>
                <v-flex xs12 class="text-xs-center">
                    <v-btn flat @click="valdiate" class="secondary" :disabled="!formData.valid">Login</v-btn>
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
                valid: false
            }
        }
    },
    methods:{
        // Validates and login
        valdiate(){
            // If form is validated
            if(this.$refs.loginForm.validate()) {
                let formDt = {};
                Object.keys(this.formData).forEach(field => formDt[field] = this.formData[field].value);
            }

            alert('Form not valid. Please provide all the required fields');
            return false;
        }
    }
}
</script>

<style>

</style>
