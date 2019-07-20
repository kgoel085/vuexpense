import Vue from 'vue'
import Router from 'vue-router'
import store from './store';

Vue.use(Router)

const router = new Router({
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
      component: () => import('./views/Login.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      props:{loginPg: false},
      component: () => import('./views/Login.vue')
    }
  ]
});

router.beforeEach((to, frm, nxt) => {
  if(to.name == 'login' || to.name == 'signup') store.commit('setNav', false);
  else store.commit('setNav', true);

  nxt();
});

export default router
