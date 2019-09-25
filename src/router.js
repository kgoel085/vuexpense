import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import firebase from './helpers/firebase'

Vue.use(Router)

// Check if user is a new user or not, If yes redirect to complete setup
const checkUser = async function(nxt){
  // If user state is already to new, redirect to user setup
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
	},
	{
		path: '/settings',
		name: 'settings',
		component: () => import('./views/Settings.vue'),
		children:[
			{
				path: '/currency',
				name: 'settings.currency',
				component: () => import('./components/Settings/currency.vue')
			},
			{
				path: '/dateformat',
				name: 'settings.date_format',
				component: () => import('./components/Settings/dateformat.vue')
			},
			{
				path: '/expense',
				name: 'settings.expense_types',
				component: () => import('./components/Settings/expense.vue')
			},
			{
				path: '/expense/manage',
				name: 'settings.manage_expense_types',
				component: () => import('./components/Settings/manageExpense.vue'),
				showAsOption: false
			},
			{
				path: '/income',
				name: 'settings.income_types',
				component: () => import('./components/Settings/income.vue')
			},
		]
	}
  ]
});

// Set up auth for each route 
router.beforeEach((to, frm, nxt) => {
  if(store.state.global.newUser && typeof store.state.global.newUser == 'string') nxt('login');

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
      //checkUser(nxt);
    }

  }  

  nxt();
});

export default router
