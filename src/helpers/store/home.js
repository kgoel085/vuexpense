// It contains all the state vars needed to manage home component

const home = {
    state: {
        disableElements: false, 
        currentDate: false,
        currentTab: false,
        tabData: {}
    },
    mutations:{
        // Set elements disability
        disableElements(state, val = false){
            state.disableElements = val;
        },
        
        // Sets current date
        setHomeDate(state, val = false){
            state.currentDate = val;
        },

        // Sets current tab 
        setHomeTab(state, val = false){
            state.currentTab = val;
        },

        // Sets current tab data
        setHomeTabData(state, val = {}){
            state.tabData = val;
        },
    },
    actions: {

    },
    getters: {

    }
};

export default home;