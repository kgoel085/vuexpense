import Vue from 'vue'
import Router from 'vue-router'
import store from './store';

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login.vue'),
      beforeEnter(to, frm, nxt){
        store.commit('setNav', false);
        nxt();
      }
    }
  ]
})
