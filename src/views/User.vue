<template>
    <v-container>
        <v-layout row wrap v-if="userData">
            <v-flex xs12></v-flex>
        </v-layout>
        <loader v-else></loader>
    </v-container>
</template>

<script>
import loader from '@/components/Loader'

export default {
    data(){
        return {
            userData: false,
            currentUser: this.$__firebase.fireauth.currentUser
        }
    },
    components:{
        loader
    },
    methods:{
        getData(){
            let userId = this.currentUser.uid;
            this.$__firebase.firestore.collection('users').doc(userId).get().then(doc => {
                if(doc.exists) this.userData = doc.data();
            }).catch(err => {
                this.$store.commit('setSnackMsg', err.message);
            });
        }
    },
    mounted(){
        this.getData();
    }
}
</script>

<style>

</style>
