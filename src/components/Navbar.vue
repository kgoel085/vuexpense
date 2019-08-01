<template>
    <v-toolbar app class="primary" v-if="show">
		<v-toolbar-title class="headline text-uppercase">
			<span>Vuetify</span>
			<span class="font-weight-light">MATERIAL DESIGN</span>
		</v-toolbar-title>
		<v-spacer></v-spacer>

		<!-- Navigation Links -->
		<v-btn flat class="secondary hidden-sm-and-down" dark :to="item.to" v-for="(item, indx) in menuItems" :key="indx">{{ item.title }}</v-btn>

		<!-- Mobile Navigation links -->
		<v-menu class="hidden-md-and-up">
			<v-toolbar-side-icon slot="activator"></v-toolbar-side-icon>
			<v-list>
			<v-list-tile v-for="(item, indx) in menuItems" :key="indx">
				<v-list-tile-content>
					<v-btn flat block light :to="item.to">{{ item.title }}</v-btn>
				</v-list-tile-content>
			</v-list-tile>   
			</v-list>
		</v-menu>
		
		
		<!-- User is logged in -->
		<template v-if="$store.state.firebase.user">
			<v-menu v-model="menu" :close-on-content-click="false" :nudge-width="200" offset-x>
				<template v-slot:activator="{ on }">
					<v-btn flat class="secondary" dark v-on="on" >
						{{ userInfo.displayName }}
					</v-btn>
				</template>

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
		</template>
    </v-toolbar>
</template>

<script>
export default {
    data(){
        return {
			menu: false,
			menuItems:[
				{title: 'Home', to: '/home'},
				{title: 'Feature Request', to: '/suggest'},
			]
        }
    },
    computed:{
      // Show / Hide navbar 
        show(){
            return this.$store.state.global.showNav;
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
        this.$__firebase.fireauth.signOut();
      }
    }
}
</script>

<style>

</style>
