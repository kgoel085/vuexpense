<template>
	<div>
		<v-toolbar app class="primary" v-if="show">
			<v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title class="headline text-uppercase">
				<span>Vuetify</span>
				<span class="font-weight-light">MATERIAL DESIGN</span>
			</v-toolbar-title>
			<v-spacer></v-spacer>

			<!-- Navigation Links -->
			<!-- <v-btn flat class="secondary hidden-sm-and-down" dark :to="item.to" v-for="(item, indx) in menuItems" :key="indx">{{ item.title }}</v-btn> -->

			<!-- Mobile Navigation links -->
			<!-- <v-menu class="hidden-md-and-up">
				<v-toolbar-side-icon slot="activator"></v-toolbar-side-icon>
				<v-list>
					<v-list-tile v-for="(item, indx) in menuItems" :key="indx">
						<v-list-tile-content>
							<v-btn flat block light :to="item.to">{{ item.title }}</v-btn>
						</v-list-tile-content>
					</v-list-tile>   
				</v-list>
			</v-menu> -->
		</v-toolbar>

		<v-navigation-drawer
			v-model="drawer"
			app
		>
			<v-list class="pa-1">
				<v-list-tile avatar  @click="showProfileMenu">
					<v-list-tile-avatar>
						<img :src="userInfo.photoUrl" >
					</v-list-tile-avatar>

					<v-list-tile-content>
						<v-list-tile-title>{{ userInfo.displayName }}</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>

			<v-menu v-model="menu" absolute :close-on-content-click="false" :nudge-width="200" offset-x>
				<v-card>
					<v-list>
						<v-list-tile avatar>
							<v-list-tile-avatar>
								<img :src="userInfo.photoUrl" alt="John">
							</v-list-tile-avatar>
							<v-list-tile-content>
								<v-list-tile-title>{{ userInfo.displayName }}</v-list-tile-title>
								<v-list-tile-sub-title></v-list-tile-sub-title>
							</v-list-tile-content>

							<v-list-tile-action>
								<v-btn icon>
									<v-icon>favorite</v-icon>
								</v-btn>
							</v-list-tile-action>
						</v-list-tile>
					</v-list>

					<v-divider></v-divider>

					<v-list>
						<v-list-tile>
							<v-list-tile-title><strong>Email: </strong> <span color="grey">{{ userInfo.email }}</span></v-list-tile-title>
						</v-list-tile>
					</v-list>

					<v-card-actions>
						<v-spacer></v-spacer>

						<v-btn flat class="primary" @click="$router.push({name: 'user'}); menu = !menu">Update Info</v-btn>
						<v-btn flat @click="logout">Logout</v-btn>
					</v-card-actions>
				</v-card>
			</v-menu>

			<v-list class="pt-0" dense>
				<v-divider></v-divider>

				<v-list-tile
					v-for="item in menuItems"
					:key="item.title"
					avatar
					@click="$router.push(item.to)"
				>
					<!-- <v-list-tile-avatar>
						<img src="https://cdn.vuetifyjs.com/images/lists/3.jpg">
					</v-list-tile-avatar> -->

					<v-list-tile-content>
						<v-list-tile-title v-html="item.title"></v-list-tile-title>
					</v-list-tile-content>
					</v-list-tile>
			</v-list>
		</v-navigation-drawer>
	</div>
</template>

<script>
export default {
    data(){
        return {
			menu: false,
			drawer: false,
			menuItems:[
				{title: 'Home', to: '/home'},
				{title: 'Add expense / income', to: '/manager'},
				{title: 'Settings', to: '/settings'},
				// {title: 'Feature Request', to: '/suggest'},
			],
        }
    },
    computed:{
      // Show / Hide navbar 
        show(){
            //return (this.$store.state.global.showNav && this.$__firebase.fireauth.currentUser) ? true : false;
            return true;
		},

		// Returns user object
		userInfo(){
			let returnVal = {
				displayName: 'User',
				email: 'NA',
				photoUrl: this.$store.state.firebase.defaultProfile
			};

			let userObj = this.$store.state.firebase.user;

			if(userObj.hasOwnProperty('displayName') && userObj.displayName) returnVal['displayName'] = userObj.displayName;
			if(userObj.hasOwnProperty('email') && userObj.email) returnVal['email'] = userObj.email;

			return returnVal;
		}
    },
    methods:{
      // Logout current user
      logout(){
		this.$store.dispatch('signUserOut');
	  },
	  
	  // Show profile menu
	  showProfileMenu (e) {
        e.preventDefault()
        this.menu = false;
        // this.x = e.clientX
        // this.y = e.clientY
        this.$nextTick(() => {
          this.menu = true
		});
      }
    }
}
</script>

<style>

</style>
