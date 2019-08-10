import Vue from 'vue'
import Vuex from 'vuex'
import global from './helpers/store/global'
import home from './helpers/store/home'
import firebase from './helpers/store/firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  mutations: {

  },
  actions: {

  },
  modules:{
    global: global,
    home: home,
    firebase: firebase
  }
})
