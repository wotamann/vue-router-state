import Vue from 'vue'

import router from './router'
import store from './store'

import stateMachine from './statemachine'  // 'vue-router-state'
import states from './statemachine/states.js'
stateMachine(store, router, states) 
 
import App from './pages/App'
 
let vm = new Vue({
  router,
  store,
  el: '#main',
  render: h => h(App),
})
