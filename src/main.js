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
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');

  let firstTimeUser = (store.state.firebase.user) ? false : true;

  store.commit('setUser', usr);

  if(!usr){
    let routeObj = {name: 'login'};
    if(!firstTimeUser) routeObj['params'] = {msg: 'User Logged / Timed Out '};

    router.push(routeObj);
  }
});

