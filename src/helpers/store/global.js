// It contains all the state vars needed at global level
const global = {
    state: { 
        showNav: true,
        updateView: true,
        snackbar:{
            show:false,
            msg: null
        }
    },
    mutations: {
        // Sets the navbar show/hide value
        setNav(state, val = true){
            state.showNav = val
        },

        // Sets the snackbar message
        setSnackMsg(state, val = null){
            state.snackbar.msg = val;
            state.snackbar.show = (val) ? true : false;
        },

        // Update the main view
        setView(state, val = true){
            state.updateView = Math.random();
        }
    },
    actions: {

    },
    getters: {

    }
};

export default global;