import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// Initialize firebase hook for vue object 
import fBase from './helpers/firebase';

Vue.config.productionTip = false

// Only mount app, if firebase auth object is ready to use
fBase.fireauth.onAuthStateChanged(usr => {
  // Default route path
  let routeObj = {name: 'login'};

  // Check for user object
  let userObj = (usr) ? usr : false;
  store.commit('setUser', userObj);

  // Render the app
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');

  // Redirect to login, if user is not there or new user is set for the current request 
  if(!usr || (store.state.global.newUser && typeof store.state.global.newUser == 'string')) router.push(routeObj);

  // Update the main view, when user is updated
  store.commit('setView');
});

