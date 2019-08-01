import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import firebase from './helpers/firebase'

Vue.use(Router)

// Check if user is a new user or not, If yes redirect to complete setup
const checkUser = async function(nxt){
  // If user state isalready to new, redirect to user setup
  if(store.state.firebase.newUser) nxt('user');

  let userDoc = firebase.firestore.collection('users').doc(firebase.fireauth.currentUser.uid);
  await userDoc.get().then(doc => {
    if(doc.exists){
      let userData = doc.data();

      // Check if user is still new or not, if yes redirect to user setup
      if(userData.hasOwnProperty('newUser') && userData.newUser) nxt('user');

      // If user is not new, but the user rules are not present , go to user setup
      //if(userData.hasOwnProperty('baseData') && !userData.baseData) nxt('user');
    }
  });
};

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
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
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('./views/User.vue')
    },
    {
      path: '/suggest',
      name: 'suggest',
      component: () => import('./views/Suggestions.vue')
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
    let currentUser = firebase.fireauth.currentUser;
    if(!currentUser) nxt('login');
    else{
      // Check if user is a new user or not 
      checkUser(nxt);
    }

  }  

  nxt();
});

export default router
