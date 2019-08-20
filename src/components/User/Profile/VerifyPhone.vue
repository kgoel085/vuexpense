<template>
    <v-layout row wrap >
        <v-flex xs12>
            <v-card flat >
                <v-card-title class="primary white--text">
                    Verify & Add Your phone number
                </v-card-title>
                <v-card-text class="pa-1">
                    <v-stepper v-model="stepperStat.stat" vertical >
                        <v-stepper-step :complete="stepperStat.stat > 1" step="1">
                            Select your country
                        </v-stepper-step>

                        <v-stepper-content step="1">
                            <v-card flat class="mb-2">
                                <v-autocomplete :items="phoneCodes" item-text="country" item-value="phoneCode" no-data-text="No data found" placeholder="Select a country"  v-model="stepperStat.phoneCode" append-outer-icon="close" @click:append-outer="stepperStat.phoneCode = false">
                                </v-autocomplete>
                            </v-card>
                            <v-btn color="primary" :disabled="!stepperStat.phoneCode" @click="stepperStat.stat = 2">Continue</v-btn>
                        </v-stepper-content>

                        <v-stepper-step :complete="stepperStat.stat > 2" step="2">
                            Enter your phone number
                        </v-stepper-step>

                        <v-stepper-content step="2">
                            <v-card flat class="mb-2" >
                                <v-text-field type="number" browser-autocomplete="off" clearable flat full-width label="Enter your number" v-model="stepperStat.phoneNumber"></v-text-field>
                            </v-card>
                            <v-btn color="primary" :disabled="!stepperStat.phoneNumber || !validPhone" @click="stepperStat.stat = 3">Continue</v-btn>
                            <v-btn flat>Cancel</v-btn>
                        </v-stepper-content>

                        <v-stepper-step :complete="stepperStat.stat > 3" step="3">
                            Verify Captcha
                        </v-stepper-step>

                        <v-stepper-content step="3">
                            <v-card flat class="mb-2" >
                                <div id="reCaptcha"></div>
                            </v-card>
                            <v-btn color="primary" :disabled="!stepperStat.captcha.verified" @click="getConfirmationCode">Continue</v-btn>
                            <v-btn flat>Cancel</v-btn>
                        </v-stepper-content>

                        <v-stepper-step :complete="stepperStat.stat > 4" step="4">
                            Enter Confirmation Code
                        </v-stepper-step>

                        <v-stepper-content step="4">
                            <v-card flat class="mb-2" >
                                <v-text-field type="text" browser-autocomplete="off" clearable flat full-width label="Enter code" v-model="stepperStat.confirmation.code"></v-text-field>
                                <v-text-field type="password" browser-autocomplete="off" clearable flat full-width label="Enter password" v-model="stepperStat.password"></v-text-field>
                            </v-card>
                            <v-btn color="primary" :disabled="!stepperStat.confirmation.code || stepperStat.confirmation.code.length == 0 || !stepperStat.password" @click="confirmCode">Continue</v-btn>
                            <v-btn flat>Cancel</v-btn>
                        </v-stepper-content>
                    </v-stepper>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
import EventBus from '../../../helpers/EventBus';
import PhoneCodes from '../../../helpers/phone-codes';
import CountryNames from '../../../helpers/country-names';
import firebase from 'firebase/app';
import 'firebase/auth';

export default {
    data(){
        return {
            // Stepper Stat
            stepperStat:{
                stat: 1,
                phoneCode: false,
                phoneNumber: null,
                captcha:{
                    element: 'reCaptcha',
                    verified: false,
                    container: null
                },
                confirmation:{
                    code: null,
                    verificationCode: null
                },
                password: null
            }
        }
    },
    computed:{
        // Returns Phone code array
        phoneCodes(){
            let returnVal = [];

            const phoneCodes = PhoneCodes;
            const countryNames = CountryNames;

            for(const cCode of Object.keys(countryNames)){
                const country = countryNames[cCode];
                const phoneCode = phoneCodes[cCode];

                returnVal.push({country, phoneCode})
            }

            return returnVal;
        },

        // Validates the currently entered phone number
        validPhone(){
            const pattern = /^[\d]{1,10}$/;
            return (this.stepperStat.phoneNumber.search(pattern) !== -1 && this.stepperStat.phoneNumber.length == 10);
        },

        // Returns current user instance
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        }
    },
    methods:{
        // Set phone auth required params
        initApp(){
            const obj = this.stepperStat.captcha;

            // Turn off phone auth app verification. Testing purpose
            //firebase.auth().settings.appVerificationDisabledForTesting = true;
            this.stepperStat.phoneNumber = "1234569870";
            this.stepperStat.confirmation.code = "123456";


            // Initiate ReCaptcha for Phone Auth
            obj.container = new firebase.auth.RecaptchaVerifier(obj.element, {
                'size': 'normal',
                'callback': function(resp){
                    obj.verified = resp;
                },
                'expired-callback': function(resp) {
                    obj.verified = false;
                }
            });
            
            obj.container.render().then(function(widgetId) {
                // Render the captcha
            });
        },

        // Request Confirmation code
        getConfirmationCode(){
            const obj = this.stepperStat;

            // Attach country code with phone number
            if(obj.phoneCode && obj.phoneCode.indexOf('+') < 0) obj.phoneCode = '+'+obj.phoneCode;
            const phoneNumber = obj.phoneCode+obj.phoneNumber;

            // Create phone auth provider object
            const provider = new firebase.auth.PhoneAuthProvider();

            // Use signInWithPhoneNumber() method to sign in user with phone number verification code
            provider.verifyPhoneNumber(phoneNumber, obj.captcha.container).then(function(verificationId){
                // SMS sent. Prompt user to type the code from the message, then verify

                // Store the verification id & move to next block
                obj.confirmation.verificationCode = verificationId;
                obj.stat += 1;
            }).catch(err => {
                obj.stat = 2;
                obj.captcha.verified = false;
                this.$store.commit('setSnackMsg', err.message);
            });
        },

        // Verify the submitted code
        confirmCode(e){
            e.preventDefault();
            const obj = this.stepperStat;

            // Create credentials from the verification id & verification code
            const finalCredential = firebase.auth.PhoneAuthProvider.credential(obj.confirmation.verificationCode,obj.confirmation.code);
            if(finalCredential){
                //Link credentials with user current logged in provider
                this.userObj.linkWithCredential(finalCredential).then(usercred => {
                    var user = usercred.user;
                    console.log("Account linking success", user);
                }, error => {
                    console.log("Account linking error", error);
                });
            }
            console.log(finalCredential);
        }
    },
    mounted(){
        // Set the required parameters
        this.initApp();

        // Get Location of IP address
        fetch('http://ip-api.com/json/?fields=countryCode,status',).then(resp => resp.json()).then(response => {
            if(response.hasOwnProperty('countryCode') && response.countryCode){
                // Check if current code exists or not
                const phoneCodes = PhoneCodes;
                const phoneCode = phoneCodes[response.countryCode];

                this.stepperStat.phoneCode = phoneCode;
            }
        });

        EventBus.$emit('setModuleStat', 1);
    }
}
</script>

<style>

</style>