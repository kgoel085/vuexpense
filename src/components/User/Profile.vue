<template>
    <v-layout row wrap>
        <v-flex xs12 v-if="UserObj">
            <v-list-tile class="grow">
                <v-layout row wrap justify-start align-center >
                    <v-list-tile-avatar color="grey darken-3" size="100" ref="dropArea" :class="{'dragBorder': dragged}">
                        <v-img class="elevation-6" :src="UserPhoto"></v-img>
                    </v-list-tile-avatar>

                    <v-list-tile-content class="px-4">
                        <v-slide-x-transition>
                            <v-list-tile-content v-if="dragged">
                                Image Dragged
                            </v-list-tile-content>
                        </v-slide-x-transition>
                        
                        <v-list-tile-title class="font-weight-medium font-italic">
                            {{ ( UserObj.displayName ) ? UserObj.displayName : 'User' }}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-layout>
            </v-list-tile>
        </v-flex>
        <loader v-else></loader>
    </v-layout>
</template>

<script>
import loader from '@/components/Loader'

export default {
    data(){
        return {
            // Drag / Drop events
            dropEvents: ['dragenter', 'dragover', 'dragleave', 'drop'],
            dragged: false
        }
    },
    computed:{
        // Current user object
        UserObj(){
            return this.$__firebase.fireauth.currentUser;
        },

        // User photo
        UserPhoto(){
            return (this.UserObj.hasOwnProperty('photoURL') && this.UserObj.photoURL) ? this.UserObj.photoURL : this.$store.state.firebase.defaultProfile;
        },
    },
    methods:{
        // Bind the required events for drag / drop area
        bindEvents(){
            let dropArea = this.$refs.dropArea;

            // Bind the drag / drop events
            if(dropArea) this.dropEvents.forEach(e => dropArea.addEventListener(e, this.handleDrop, false));


        },

        // Handle the drag drop events
        handleDrop(event){

            // Disable default events
            event.preventDefault();
            event.stopPropagation();

            let {type: eType} = event;

            switch(eType){
                case 'dragenter':
                    if(!this.dragged) this.dragged = true;
                break;

                case 'dragover':

                break;

                case 'dragleave':
                    if(this.dragged) this.dragged = false;
                break;

                case 'drop':
                    if(this.dragged) this.dragged = false;
                break;
            }
        }
    },
    components:{
        loader
    },
    mounted(){
        if(this.UserObj) this.bindEvents();
    }
}
</script>

<style scoped>
    .dragBorder{
        border: 5px dashed blueviolet;
        border-radius: 100%
    }
</style>
