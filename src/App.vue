<template>
  <v-app :key="$store.state.global.updateView">
    <!-- Navbar --> 
    <Navbar></Navbar>  

    <v-content>
      
      <!-- Router views -->
      <router-view></router-view>

    </v-content>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbarShow" color="info" >
      {{ snackbarMsg }}
      <v-btn
          dark
          flat
          @click="snackbarShow = false;"
      >
          Close
      </v-btn>
    </v-snackbar>

	<!-- Show calculator -->
	<v-dialog v-model="showCalc" hide-overlay width="40%">
		<Calculator></Calculator>
	</v-dialog>
  </v-app>
</template>

<script>
import Navbar from './components/Navbar';
import Calculator from './components/Calculator';
import EventBus from './helpers/EventBus';

export default {
  name: 'App',
  components: {
	Navbar,
	Calculator
  },
  data () {
    return {
	  snackbarShow: false,
	  showCalc: false
    }
  },
  watch:{
    // If snackbar is closed remove the global snack msg
    snackbarShow(val){
      if(val == false){
        this.$store.commit('setSnackMsg', null);
      }
    }
  },
  computed:{
    // Snackbar message
    snackbarMsg(){
      if(this.$store.state.global.snackbar.msg){
        this.snackbarShow = true;
        return this.$store.state.global.snackbar.msg;
      }else{
        this.snackbarShow = false;
      }
      return null;
    }
  },
  mounted(){
	EventBus.$on('showCalc', (stat = false) => {
		this.showCalc = stat
	});
  }
}
</script>
