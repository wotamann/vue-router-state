export default (store, router, stateMachine) => {

  if(!stateMachine || !stateMachine.states) throw 'No valid states definition in vue-router-state!';

  stateMachine.config = stateMachine.config || {}
  stateMachine.current = stateMachine.current || {}

  const { 
    moduleName = 'stateMachineModul',
    initialState,
    debug, 
    storageKey = 'router-statemachine', 
    storageTypeSession
  } = stateMachine.config
  
  const debugFunction = typeof(debug) === 'function' ? debug : debug ? (s) => console.log('log router-statemachine:', s) : ()=>{}        
  
  // get current state from storage or from initialState or take first key in states  
  stateMachine.current.state = stateMachine.current.state || initialState || Object.keys(stateMachine.states)[0]
  
  const storageType = storageTypeSession ? sessionStorage : localStorage          
  const setStateMachineToStorage = (value) => value ? storageType.setItem(storageKey, JSON.stringify(value)) : null;
  const getStateMachineFromStorage = () => JSON.parse(storageType.getItem(storageKey) || null); 
  const StateMachineFromStorage = getStateMachineFromStorage();
  stateMachine = StateMachineFromStorage ? StateMachineFromStorage : stateMachine 

  store.registerModule(moduleName, {
    namespaced:true,
 
    state: {
      stateMachine  
    },

    mutations: {
      STATE_MACHINE_TRANSITION(state, {transition, data} = {}) {
        const currentState = state.stateMachine.current.state;        
        const nextState = state.stateMachine.states[currentState][transition] || currentState;        
        const nextPath = getMatchingPathFromState(nextState)
        
        if ( nextState && nextPath ){
          state.stateMachine.current.lastState = currentState;
          state.stateMachine.current.transition = transition;
          state.stateMachine.current.path = nextPath;
          state.stateMachine.current.state = nextState;
          state.stateMachine.current.nextTransitions = Object.assign({}, state.stateMachine.states[nextState])     
          state.stateMachine.current.data = data ? Object.assign({}, data): null 
          setStateMachineToStorage(state.stateMachine);  
        }

        debugFunction(state.getState())

        router.replace(getMatchingPathFromState(state.stateMachine.current.state))         
      }
    },      

    actions:  {
      stateMachineNext({ commit }, transition) { 
        transition = typeof(transition) === 'string' ? {transition} : transition        
        commit('STATE_MACHINE_TRANSITION', transition) 
      },
    } 
  })

   /* 
      {path: '/error', meta:{state:'failure'}, name: 'Error', component: Failure } 
      state: failure -> path: /error 
      
      {path: '/failure', name: 'Error', component: Failure } 
      state: failure -> path: /failure 
      
      {path: '/failure', name: 'Error', component: Failure } 
      state: Something -> path: null
      
      state: undefined -> path: null
      routes.filter:[] -> path: null
    */ 
  const getMatchingPathFromState = (state)=> {   
    try {
      return router.options.routes.filter( r => getStateFromRoute(r) === state.toLowerCase())[0].path       
    } catch (error) {
      return null
    }
  }

  const getStateFromRoute = (route)=> {
    let toState = (route.meta && route.meta.state) ? route.meta.state : route.path  
    return toState.toLowerCase().replace(/^\/|\/$/g, '')
  }

  // Watch navigation
  router.beforeEach((to, from, next) => {    
    // is pathTo ident with new current state, then next(true) otherwise cancel with next(false)
    return next(getStateFromRoute(to) === stateMachine.current.state.toLowerCase())
  })

  /* Exposed Function: transitNextState()

    string: transition = 'login' 
    object: transition = { transition:'login', data: { foo:'foo' } }   

    store.state[moduleName].transitNextState(transition) 
    // is syntactic sugar for store.dispatch(`${moduleName}/stateMachineNext`, transition)    
  */
  store.state[moduleName].transitNextState = (transition) => store.dispatch(`${moduleName}/stateMachineNext`, transition)
  
  /* Exposed Function: getState()
    ... in VUE Component
    computed: {      
      geState: function(){return this.$store.state.stateMachineModul.getState()}   
      // syntactic sugar for this.$store.state.stateMachineModul.stateMachine.current}
    }
  */
  store.state[moduleName].getState = () => Object.assign({},store.state[moduleName].stateMachine.current)
  
  // Initialisation 
  store.state[moduleName].transitNextState() 
  
  // Function to unregister module
  return () => store.unregisterModule(moduleName)
  
}

