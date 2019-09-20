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
                    <v-text-field :type="formData.password.showPass ? 'text' : 'password'" label="Password" v-model="formData.password.value" :rules="formData.password.rules"></v-text-field>
                </v-flex>
                <v-flex xs12 v-else>
                    <v-layout row wrap>
                        <v-flex xs12 sm6 md6 lg6 xl6 class="pa-1">
                            <v-text-field :type="formData.password.showPass ? 'text' : 'password'" label="Password" v-model="formData.password.value" :rules="formData.password.rules" ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md6 lg6 xl6 class="pa-1">
                            <v-text-field :type="formData.confirmPassword.showPass ? 'text' : 'password'" label="Confirm Password" v-model="formData.confirmPassword.value" :rules="formData.confirmPassword.rules" ></v-text-field>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs12 class="text-xs-center">
                    <v-btn flat @click="valdiate" class="secondary" :disabled="!formValid || disableBtn">{{ title }}</v-btn>
                    <v-btn flat :to="btnUrl" class="secondary" :disabled="disableBtn" v-if="!$store.state.firebase.newUser">{{ btnTitle }}</v-btn>
                </v-flex>
            </v-layout>

            <v-layout v-if="disableBtn">
                <v-flex xs12>
                    <loader></loader>
                </v-flex>
            </v-layout>
        </v-container>

        <!-- Demo Sign Up snackbar -->
        <v-snackbar v-model="demoSignUp" color="blue darken-2" bottom right multi-line :timeout="0">
            <v-layout row wrap class="text-xs-center">
                <v-flex xs12 >
                    <strong>Please use the below details at the login screen to sign in</strong>
                </v-flex>
                <v-flex xs12 class="py-2">
                    <strong>Email: </strong> test@test.com<br>
                    <strong>Password: </strong> 12345678
                </v-flex>
            </v-layout>
        </v-snackbar> 

        <!-- Show login / signup related msgs -->
        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            bottom
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
const loader = () => import('../components/Loader'); 

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
            formValid: false,

            // For demo sign Up only
            demoSignUp: (process.env.VUE_APP_SIGN_UP == 1) ? true : false
        }
    },
    components:{
        loader
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

            if(this.demoSignUp && !this.loginPg){
                this.$store.commit('setSnackMsg', 'Sign Up triggered');
                this.demoSignUp = true;
                this.$refs.loginForm.reset();

                this.$router.push({name: 'login'});

                this.disableBtn = false;

                return false;
            }

            // Set required function to be called
            let auth = (this.loginPg) ? 'signInWithEmailAndPassword' : 'createUserWithEmailAndPassword';

            this.$__firebase.fireauth[auth](email, pass).then(resp => {
                
                // If page is not login
                if(!this.loginPg){
                    // Create user collection entry
                    return this.createUser(resp.user);
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
                    const msg = `Sign Up successfull.`;
                    
                    this.$store.commit('setNewUser', msg);
                    this.$store.dispatch('signUserOut', msg);
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

        // If signed / logged in redirect to home and only redirect if user is not new ( Signed Up )
        if(this.loginPg && this.$store.state.firebase.user && !this.$store.state.global.newUser) this.$router.push({name: 'home'});

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
