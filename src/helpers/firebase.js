import Vue from 'vue'

// Include firebase core, auth, fire-store
import firebase from 'firebase/app';
import 'firebase/firestore';

let fBase = (function(){
    
    // Holds the initiated instances for firebase
    let app,fStore;

    // Initiates firebase instance for provided firebase
    const initApp = () => {
        // If already initiated, return same
        if(app !== undefined && typeof app == 'object') return app;

        try{
            // Initialize firebase
            let fireDbConfig = {};
            if(process.env.hasOwnProperty('VUE_APP_ID') && process.env.VUE_APP_ID) fireDbConfig['appId'] = process.env.VUE_APP_ID;
            if(process.env.hasOwnProperty('VUE_APP_API_KEY') && process.env.VUE_APP_API_KEY) fireDbConfig['apiKey'] = process.env.VUE_APP_API_KEY;
            if(process.env.hasOwnProperty('VUE_APP_AUTH_DOMAIN') && process.env.VUE_APP_AUTH_DOMAIN) fireDbConfig['authDomain'] = process.env.VUE_APP_AUTH_DOMAIN;
            if(process.env.hasOwnProperty('VUE_APP_DATABASE_URL') && process.env.VUE_APP_DATABASE_URL) fireDbConfig['databaseURL'] = process.env.VUE_APP_DATABASE_URL;
            if(process.env.hasOwnProperty('VUE_APP_PROJECT_ID') && process.env.VUE_APP_PROJECT_ID) fireDbConfig['projectId'] = process.env.VUE_APP_PROJECT_ID;
            if(process.env.hasOwnProperty('VUE_APP_STORAGE_BUCKET') && process.env.VUE_APP_STORAGE_BUCKET) fireDbConfig['storageBucket'] = process.env.VUE_APP_STORAGE_BUCKET;
            if(process.env.hasOwnProperty('VUE_APP_MESSAGE_SENDER_ID') && process.env.VUE_APP_MESSAGE_SENDER_ID) fireDbConfig['messagingSenderId'] = process.env.VUE_APP_MESSAGE_SENDER_ID;

            app = firebase.initializeApp(fireDbConfig);
            return app;
        }
        catch(err){
            console.log('Initialize Err: ', err.message);
        }  
    };


    // Initialize firestore instance from initated app
    const initStore = () => {
        // Check if app is initiated
        let app = (app !== undefined) ? app : initApp();
        
        // If yes, return firestore instance
        if(app) fStore = app.firestore();
        
        return fStore;
    };

    return {
        // Returns firestore instance
        firestore: initStore()
    }
})();

// Check if prototype is available or not
if(!Vue.prototype.hasOwnProperty('$__firebase')) Vue.prototype.$__firebase = fBase;

export default fBase;