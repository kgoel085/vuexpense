<template>
    <v-layout row wrap>
        <v-flex xs12 v-if="UserObj">
            <v-list-tile class="grow">
                <v-layout row wrap justify-start align-center >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-list-tile-avatar color="grey darken-3" size="100" v-on="on" ref="dropArea" :class="{'dragBorder': dragged}" @click="showFile">
                                <v-img class="elevation-6" :src="UserPhoto"></v-img>
                            </v-list-tile-avatar>
                        </template>
                        <span>Drag / Drop image for new profile picture</span>
                    </v-tooltip>

                    <v-slide-x-transition>
                        <v-list-tile-avatar color="grey darken-3 mx-2" size="100" v-if="dragged && !draggedImg.error">
                            <v-img class="elevation-6" :src="(draggedImg.src) ? draggedImg.src : UserPhoto"></v-img>
                        </v-list-tile-avatar>
                    </v-slide-x-transition>
                    
                    <v-list-tile-content class="px-4">
                        <v-list-tile-title class="font-weight-medium font-italic">
                            <span>{{ ( UserObj.displayName ) ? UserObj.displayName : 'User' }}</span>
                        </v-list-tile-title>
                        <small v-if="draggedImg.error" class="red--text">{{ draggedImg.error }}</small>
                    </v-list-tile-content>
                </v-layout>
                <input type="file" id="fileElem" accept="image/*" style="display: none">
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
            dragged: false,
            draggedImg:{
                src: null,
                error: false
            }
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
    watch:{
        'draggedImg.error'(val){
            if(val){
                this.draggedImg.src = false;
                this.dragged = false
            }
        },
        dragged(val){
            if(val){
                this.draggedImg.src = false;
                this.draggedImg.error = false;
            }
        }
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
                    
                break;

                case 'dragover':
                    if(!this.dragged) this.dragged = true;
                break;

                case 'dragleave':
                    if(this.dragged) this.dragged = false;
                break;

                case 'drop':
                    // if(this.dragged) this.dragged = false;
                    this.handleFiles(event);
                break;
            }
        },

        // Handles the dropped file
        handleFiles(e){
            this.draggedImg.error = false;

            let file = false;

            if(e.hasOwnProperty('dataTransfer')){
                let dt = e.dataTransfer
                [file] = dt.files
            }else{
                this.dragged = true;
                file = e[0]
            }

            // Check if actual file is dropped or not
            if(!file){
                this.draggedImg.error = 'Invalid file dropped.';
            }

            // Check whether file is correct format or not
            let fileType = file.type;
            if(!fileType || fileType.toLowerCase().indexOf('image')){
                this.draggedImg.error = 'Invalid file format !';
            }

            // If any error is there, return false;
            if(this.draggedImg.error) return false; 

            // Load file src as string
            let fileObj = new FileReader();
            fileObj.readAsDataURL(file);

            // Set file src on load 
            fileObj.onloadend = () => {
                this.draggedImg.error = false;
                this.draggedImg.src = fileObj.result;
                this.$emit('userProfileUpdated' , fileObj.result);
            }
        },

        showFile(){
            let fileElem = document.querySelector('#fileElem');
            if(fileElem) fileElem.click();
        }
    },
    components:{
        loader
    },
    mounted(){
        if(this.UserObj) this.bindEvents();

        let vm = this;
        document.querySelector('#fileElem').addEventListener('change', function(event){
            vm.handleFiles(document.querySelector('#fileElem').files);
        });
    }
}
</script>

<style scoped>
    
</style>
