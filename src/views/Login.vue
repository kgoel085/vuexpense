<template>
    <v-form ref="loginForm" name='loginForm' v-model="formValid" @keyup.native.enter="valdiate">
        <v-container fluid>
            <v-layout row wrap>
                <v-flex xs12>
                    <h1>{{ title }}</h1>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container>
            <v-layout row wrap>
                <v-flex xs12 v-if="!loginPg" >
                    <v-text-field autofocus label="Username" v-model="formData.username.value" :rules="formData.username.rules"></v-text-field>
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
                    <v-btn flat @click="valdiate" class="secondary" :disabled="!formValid || disableBtn">{{ title }}</v-btn>
                    <v-btn flat :to="btnUrl" class="secondary" :disabled="disableBtn" v-if="!$store.state.firebase.newUser">{{ btnTitle }}</v-btn>
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
                @click="snackbar.show = false; snackbar.msg = null; snackbar.color = 'error';"
            >
                Close
            </v-btn>
        </v-snackbar>
    </v-form>
</template>

<script>
import filter from '../helpers/filters';

export default {
    data(){
        return{
            // Secondary btn title
            btnTitle: null,

            // Info snackbar
            snackbar: {
                show: false,
                msg: null,
                color: 'error'
            },

            // Disable btn
            disableBtn: false,

            // Form valid
            formValid: false
        }
    },
    computed:{
        // Returns title
        title(){
            if(this.loginPg){
                this.btnTitle = 'Sign Up';
                return 'Login';
            }
            
            this.btnTitle = 'Login';
            return 'Sign Up';
        },

        // Handles the second button on the page, 
        btnUrl(){
            if(this.loginPg) return '/signup';
            return '/login';
        },

        // Form validation filters
        filterArr(){
            return (this.loginPg) ? ['username', 'email', 'password']:  ['username', 'email', 'password', 'confirmPassword'];
        },

        // Form validation rules
        formData(){
            let returnObj = {};

            // Get all the filters
            this.filterArr.forEach(key => {
                const [reqFilter]= filter.getFilters([key]);
                returnObj[key] = reqFilter;
            });

            return returnObj;
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

            // Show error
            this.snackbar.msg = 'Form not valid. Please provide all the required fields';
            this.snackbar.color = 'error';
            this.snackbar.show = true; 

            return false;
        },
        
        // Logs / signs user in
        manageUser(email, pass){

            // Disable both buttons
            this.disableBtn = true;

            // Set required function to be called
            let auth = (this.loginPg) ? 'signInWithEmailAndPassword' : 'createUserWithEmailAndPassword';

            this.$__firebase.fireauth[auth](email, pass).then(resp => {
                
                // If page is not login
                if(!this.loginPg){
                    
                    // Create user collection entry
                    this.createUser(resp.user);
                    
                }else{
                    // For logged in user
                    if(resp.hasOwnProperty('user')){
                        this.$store.commit('setUser', resp.user);
                        //this.$store.commit('setNewUser', false);

                        this.$store.commit('setSnackMsg', 'User logged in successfully.');
                    }
                    
                    this.$router.push({name: 'home'});
                }
                
            }).catch(err => {
                this.disableBtn = false;
                this.snackbar.msg = err.message;
                this.snackbar.show = true;
            });
            
        },

        // Create user document 
        createUser(user = false){
            if(user){
                let vm = this;
                // Create document for newly created user
                this.$__firebase.firestore.collection('users').doc(user.uid).set({
                    newUser: false
                }).then(resp => {
                    // Update user name

                    let username = vm.formData.username.value;
                    vm.disableBtn = false;
                    
                    return user.updateProfile({
                        displayName: vm.formData.username.value
                    });
                }).then(() => {

                    // Sign out new user , default working of firebase
                    this.$store.commit('setNewUser', `Sign Up successfull.`);
                    this.$__firebase.fireauth.signOut();
                
                }).catch(err => {
                    this.disableBtn = false;

                    this.snackbar.msg = err.message;
                    this.snackbar.show = true;

                });
            }
        }
    },
    props:{
        // Decides whether a login / sign up page is requested
        loginPg:{
            default: true,
            type: Boolean
        },

        // Show msg in the snackbar is set
        msg:{
            default: null,
            type: String
        }
    },
    mounted(){
        let vm = this;
        vm.$refs.loginForm.reset();

        // If signed / logged in redirect to home
        if(this.$store.state.firebase.user){
            this.$router.push({name: 'home'});
        }

        // Show msg if set any
        if(this.msg || this.$store.state.firebase.newUser){
            this.snackbar.msg = (this.msg || this.$store.state.firebase.newUser);
            this.snackbar.color = "info";
            this.snackbar.show = true;
        }
    }
}
</script>

<style>

</style>
