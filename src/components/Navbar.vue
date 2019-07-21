<template>
    <v-toolbar app class="primary" v-if="show">
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- User is logged in -->
      <v-btn v-if="$store.state.firebase.user" flat @click="logout">
        Logout
      </v-btn>

    </v-toolbar>
</template>

<script>
export default {
    data(){
        return {
            
        }
    },
    computed:{
      // Show / Hide navbar 
        show(){
            return this.$store.state.global.showNav;
        }
    },
    methods:{
      // Logout current user
      logout(){
        this.$__firebase.fireauth.signOut().then(resp => {
          this.$store.commit('setUser', null);
          this.$router.push({
            name: 'login',
            params: {msg: 'User Logged Out successfully'}
          });
        }).catch(err => {
          this.$store.commit('setSnackMsg', 'User logged in successfully.');
        });
      }
    }
}
</script>

<style>

</style>
