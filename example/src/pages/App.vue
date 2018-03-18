<template>
 <div class="base" :class="css">
    <p>States-Object<p>
    {{states}}
    <hr>
    <p>Current State<p>
    {{currentState}}
    <hr>

    <router-view></router-view>
    
    <div>
      <p>Valid Transitions for state "{{currentState.state}}" - path "{{currentState.path}}" are {{nextTransitions}}</p>
      <a @click="nexTransition('success')" >Success</a>
      <a @click="nexTransition('detail')" >Detail</a>
      <a @click="nexTransition('back')" >Back</a>
      <a @click="nexTransition('failure')" >Failure</a>
      <a @click="nexTransition('logout')" >Logout</a>
      <a @click="nexTransition('reset')" >Reset</a>
    </div>  
  </div>
</template>

<script>
import states from '../statemachine/states.js'

export default {
  data(){
    return {
      states,
      css:'valid'
    }
    },
  computed: {      
    currentState:function(){return this.$store.state.stateMachineModul.getState()},
    nextTransitions: function(){return this.currentState && this.currentState.nextTransitions ? Object.keys(this.currentState.nextTransitions):''}
  },
  methods:{
    nexTransition(transition){
      this.css =  this.currentState.nextTransitions && this.currentState.nextTransitions[transition] ? 'valid' : 'invalid' 
      this.$store.state.stateMachineModul.transitNextState({transition})
    }
  }  
}
</script>

<style scoped>
  .base {color:#448; font-family: Arial, Helvetica, sans-serif}
  .valid {background-color: #eeffee}
  .invalid {background-color: #ffeeee}
  a {padding:6px; text-decoration: none; background-color: #ccc}
</style>
