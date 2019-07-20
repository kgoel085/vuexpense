<template>
    <v-toolbar app class="primary" v-if="show">
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        to="/login"
      >
        <span class="mr-2">Login</span>
      </v-btn>
      <v-btn flat @click="logout">
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
          console.log('User signed out');
          this.$router.push({
            name: 'login'
          });
        }).catch(err => {
          console.log(err);
        });
      }
    }
}
</script>

<style>

</style>
