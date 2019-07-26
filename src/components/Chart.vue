<template>
    <v-layout row wrap>
        <v-flex xs12>
            <canvas id="piechart" ref="piechart"></canvas>
        </v-flex>
    </v-layout>
</template>

<script>
import Chart from 'chart.js'

export default {
    data(){
        return {
            chartObj: null
        }
    },
    methods:{
        createChart(chartData){
            const ctx = this.$refs.piechart;
            this.chartObj = new Chart(ctx, {
                type: chartData.type,
                data: chartData.data,
                options: chartData.options,
            });
        }
    },
    props:{
        dataObj:{
            default: {},
            type: Object
        }
    },
    mounted(){
        this.createChart(this.dataObj);
    }
}
</script>

<style>

</style>
