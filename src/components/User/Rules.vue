<template>
    <v-layout row wrap>
        <v-flex xs12>
            
        </v-flex>
    </v-layout>
</template>

<script>
export default {
    data(){
        return {
           
        }
    },
    computed:{
        
    },
    methods:{
        // Generates random colors
        getRandomColor(){
            let letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    },
    props:{
        user: {
            default: {},
            type: Object
        },
        doc:{
            default: {},
            type: Object
        }
    }
}
</script>

<style>

</style>
