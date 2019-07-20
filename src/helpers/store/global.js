// It contains all the state vars needed at global level
const global = {
    state: { 
        showNav: true
    },
    mutations: {
        // Sets the navbar show/hide value
        setNav(state, val = true){
            state.showNav = val
        }
    },
    actions: {

    },
    getters: {

    }
};

export default global;