<template>
<v-layout row wrap>
	<v-flex xs12>
		<v-card flat color="transparent">
			<v-card-text>
				<div id="calculator">
					<div class="calculator-logs">
						<span v-for="(log, index) in logs" :key="index">{{ log }}</span>
					</div>

					<input type="string" class="calculator-input" v-model="value" @keyup.enter="getResult()">

					<div class="calculator-row">
						<div class="calculator-col">
							<button class="calculator-btn gray action" @click="clear()">C</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn gray action" @click="del()">del</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn gray action" @click="addExpresion('%')">%</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn accent action" @click="addExpresion('/')">/</button>
						</div>
					</div>
					<div class="calculator-row">
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(7)">7</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(8)">8</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(9)">9</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn accent action" @click="addExpresion('*')">*</button>
						</div>
					</div>
					<div class="calculator-row">
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(4)">4</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(5)">5</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(6)">6</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn accent action" @click="addExpresion('-')">-</button>
						</div>
					</div>
					<div class="calculator-row">
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(1)">1</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(2)">2</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(3)">3</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn accent action" @click="addExpresion('+')">+</button>
						</div>
					</div>
					<div class="calculator-row">
						<div class="calculator-col">
							<button class="calculator-btn" @click="addExpresion(0)">0</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn action" @click="addExpresion('.')">.</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn accent action" @click="getResult()">=</button>
						</div>
						<div class="calculator-col">
							<button class="calculator-btn accent action success" @click="setResults()">OK</button>
						</div>
					</div>
					</div>
			</v-card-text>
		</v-card>
	</v-flex>
</v-layout>

</template>

<script>
import EventBus from '../helpers/EventBus';

export default {
	data(){
		return {
			value: 0,
			logs:  []
		}
	},
	methods:{
		addExpresion(e) {
			if ( Number.isInteger(this.value) )
				this.value = ''; 
			this.value += e;
		},
		getResult() {
			let log = this.value;
			this.value = eval(this.value);
			this.logs.push( log + `=${this.value}` );
		},
		clear() {
			this.value = 0;
		},
		del() {
			this.value = this.value.slice(0, -1);
		},
		setResults(){
			//if(this.value){
				EventBus.$emit('calcResults', this.value);
				EventBus.$emit('showCalc', false);
				this.$store.commit('setNav', true);
				this.clear();
			//}
		}
	},
	created(){
		// Hide navbar
		this.$store.commit('setNav', false);
	},
	mounted(){
		this.value = 0;
	}
}
</script>

<style scoped>
	*,
::after,
::before {
  box-sizing: border-box;
}

body {
  margin: 0;
  height: 100vh;
  display: flex;
  font-size: 10px;
  align-items: flex-end;
  justify-content: center;
  background-color: #2f2f31;
}

#calculator {
  width: 100%;
  margin: 0 auto;
  display: flex;
  padding: 0;
  max-width: 320px;
  min-width: 320px;
  flex-direction: column;
  background-color: #2f2f31;
}
#calculator .calculator-logs {
  height: 80px;
  display: flex;
  position: relative;
  overflow: hidden;
  align-items: flex-end;
  flex-direction: column;
  justify-content: flex-end;
}
#calculator .calculator-logs:before {
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  content: "";
  z-index: 5;
  position: absolute;
  background: linear-gradient(to bottom, #2f2f31, rgba(47, 47, 49, 0));
}
#calculator .calculator-logs span {
  color: #d4d4d2;
  opacity: 0.75;
  display: block;
  font-size: 0.8rem;
  text-align: right;
  margin-top: 0.4rem;
  line-height: 1;
  font-weight: lighter;
}
#calculator .calculator-input {
  color: #d4d4d2;
  width: 100%;
  border: none;
  padding: 0.8rem;
  display: block;
  font-size: 2.4rem;
  background: none;
  text-align: right;
  font-weight: lighter;
}
#calculator .calculator-input:focus, #calculator .calculator-input:active {
  outline: none;
}
#calculator .calculator-row {
  display: flex;
  padding: 0;
  justify-content: space-around;
}
#calculator .calculator-row .calculator-col {
  flex: 1;
  box-shadow: 0 0 0 1px #2f2f31;
}
#calculator .calculator-row .calculator-col.wide {
  flex: 2;
}
#calculator .calculator-btn {
  width: 100%;
  color: #d4d4d2;
  border: none;
  cursor: pointer;
  padding: 0.8rem;
  outline: none;
  font-size: 1.6rem;
  transition: all 0.3s ease-in-out;
  font-weight: 200;
  justify-content: center;
  background-color: #616163;
}
#calculator .calculator-btn.accent {
  background-color: #f49e3f;
  color: #fff;
}
#calculator .calculator-btn.gray {
  background-color: #424345;
}
#calculator .calculator-btn:active {
  background-color: #2f2f31;
}

</style>