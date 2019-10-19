import chart from 'vue-chartjs'
const { reactiveProp } = chart.mixins

const basicOpt = {
  props: ['options'],
  mixins: [reactiveProp],
  mounted() {
    this.renderChart(this.chartData, this.options)
  }
}


let chartExport = {}
Object.keys(chart).forEach(chartType => {
  const currentChart = chart[chartType]
  const cType = {...basicOpt, extends: currentChart}

  if(!chartExport.hasOwnProperty(chartType)) chartExport[`${chartType}Chart`] = {}
  chartExport[`${chartType}Chart`] = cType
})

console.log(chartExport)

export default {...chartExport}