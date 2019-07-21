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
      props: true,
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

// Set up auth for each route 
router.beforeEach((to, frm, nxt) => {
  // For login / signup routes only
  if(to.name == 'login' || to.name == 'signup'){
    store.commit('setNav', false);
  }else{
    // For every other routes
    store.commit('setNav', true);

    // Check if user is logged in or not
    if(!store.state.firebase.user){
      nxt('/login');
      return false;
    }
  }  

  nxt();
});

export default router
