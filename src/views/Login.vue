<template>
    <v-form ref="loginForm" v-model="formData.valid">
        <v-container fluid>
            <v-layout row wrap>
                <v-flex xs12>
                    <h1>{{ title }}</h1>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container>
            <v-layout row wrap>
                <v-flex xs12>
                    <!-- <v-text-field autofocus label="Username" v-model="formData.username.value" :counter="10" :rules="formData.username.rules"></v-text-field> -->
                </v-flex>
                <v-flex xs12>
                    <v-text-field label="Email" v-model="formData.email.value" :rules="formData.email.rules"></v-text-field>
                </v-flex>
                <v-flex xs12 v-if="loginPg">
                    <v-text-field :type="formData.password.showPass ? 'text' : 'password'" label="Password" v-model="formData.password.value" :rules="formData.password.rules" @click:append="formData.password.showPass = !formData.password.showPass" :append-icon="formData.password.showPass ? 'visibility' : 'visibility_off'"></v-text-field>
                </v-flex>
                <v-flex xs12 v-else>
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
                    <v-btn flat @click="valdiate" class="secondary" :disabled="!formData.valid">{{ title }}</v-btn>
                    <v-btn flat to="/signup" class="secondary" v-if="loginPg">Sign Up</v-btn>
                </v-flex>
            </v-layout>
        </v-container>

        <!-- Show login / signup related msgs -->
        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
        >
            {{ snackbar.msg }}
            <v-btn
                dark
                flat
                @click="snackbar.show = false; snackbar.msg = null; snackbar.color = 'error' "
            >
                Close
            </v-btn>
        </v-snackbar>
    </v-form>
</template>

<script>
export default {
    data(){
        return{
            snackbar: {
                show: false,
                msg: null,
                color: 'error'
            },
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
                        v => !!v || 'Password is required',
                        v => (v && v.length > 6) || 'Password must be greater than 6 characters'
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
    computed:{
        title(){
            if(this.loginPg) return 'Login';
            return 'Sign Up';
        }
    },
    methods:{
        // Validates and login
        valdiate(){
            // If form is validated
            if(this.$refs.loginForm.validate()) {
                let email = this.formData.email.value;
                let password = this.formData.password.value;

                // Create / login user
                this.manageUser(email, password);

                return false;
            }

            this.snackbar.msg = 'Form not valid. Please provide all the required fields';
            this.snackbar.color = 'error';
            this.snackbar.show = true; 

            return false;
        },
        
        // Logs user in
        manageUser(email, pass){
            // Set required function to be called
            let auth = (this.loginPg) ? 'signInWithEmailAndPassword' : 'createUserWithEmailAndPassword';
            this.$__firebase.fireauth[auth](email, pass).then(resp => {
                this.$refs.loginForm.reset();

                let routeName = 'home';

                // If page is not login
                if(!this.loginPg){
                    routeName = 'login';

                    // Sign out new user , default working of firebase
                    this.$__firebase.fireauth.signOut();
                }else{
                    if(resp.hasOwnProperty('user')){
                        this.$store.commit('setUser', resp.user);
                    }
                }

                if(routeName == 'home') this.$store.commit('setSnackMsg', 'User logged in successfully.');
                // Push to the decided page / route
                this.$router.push({name: routeName});
            }).catch(err => {
                this.snackbar.msg = err.message;
                this.snackbar.show = true;
            });
            
        }
    },
    props:{
        loginPg:{
            default: true,
            type: Boolean
        },
        msg:{
            default: null,
            type: String
        }
    },
    mounted(){
        // If signed / logged in redirect to home
        if(this.$store.state.firebase.user){
            this.$router.push({name: 'home'});
        }

        // Show msg if set any
        if(this.msg){
            this.snackbar.msg = this.msg;
            this.snackbar.color = "info";
            this.snackbar.show = true;
        }
    }
}
</script>

<style>

</style>
