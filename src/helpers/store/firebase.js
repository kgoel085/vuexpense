// It contains all the state vars needed at global level
const firebase = {
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
        },

        // Sets the current state of the signed up user
        setNewUser(state, usr = false){
            state.newUser = usr;
        }
    },
    actions: {

    },
    getters: {

    }
};

export default firebase;