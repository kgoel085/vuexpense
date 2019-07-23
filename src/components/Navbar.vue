<template>
    <v-toolbar app class="primary" v-if="show">
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- User is logged in -->
      <template v-if="$store.state.firebase.user">
        <v-menu open-on-hover bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              color="secondary"
              v-on="on"
            >
              {{ $store.state.firebase.user.displayName }}
            </v-btn>
          </template>
            <v-list>
              <v-list-item class="pa-0 ma-0">
                <v-btn flat @click="logout">Logout</v-btn>
              </v-list-item>
            </v-list>
        </v-menu>
      </template>
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
        this.$__firebase.fireauth.signOut();
      }
    }
}
</script>

<style>

</style>
