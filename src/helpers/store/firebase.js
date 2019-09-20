// Initialize firebase hook for vue object 
import fBase from '../../helpers/firebase';
import router from '../../router';

// It contains all the state vars needed at global level
const firebaseObj = {
    state: { 
        // States current auth status of the user
        user: false,

        // Default profile pic for every user
        defaultProfile: 'https://api.adorable.io/avatars/400/abott@adorable',

        // User is newly created 
        newUser: false
    },
    mutations: {
        // Sets the current auth state of the user
        setUser(state, usr = false){
            state.user = usr;
            if(usr && usr.hasOwnProperty('photoURL') && usr.photoURL) state.defaultProfile = usr.photoURL;
        },

        // Sets the current state of the signed up user
        setNewUser(state, usr = false){
            state.newUser = usr;
        }
    },
    actions: {
        // Sign user out
        signUserOut(context, val = 'User signed out'){
            fBase.fireauth.signOut().then(resp => {
                router.push({
                    name: 'login', 
                    params:{msg: val}
                });
            }).catch(err => {
                
            });
        }
    },
    getters: {

    }
};

export default firebaseObj;