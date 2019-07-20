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
    </v-toolbar>
</template>

<script>
export default {
    data(){
        return {
            
        }
    },
    computed:{
        show(){
            return this.$store.state.global.showNav;
        }
    }
}
</script>

<style>

</style>
