# vue-route-state 

VUE implementation of a statemachine based on VUEX and VUE-ROUTER to handle all routes in your application. vue-route-state makes routing VUE Pages consistent and simple. 

Routing from current VUE-page to the next Page works with with  `StateMachine.transitNextState('transition')` instead of `router.push('/nextpage')`. Transition moves current state to next state and if any route in routes is matching the new state, then your app will route to the next VUE-page.   

Your application can only **route from state to state in a predefined way**. These interdependencies between states by means of transitions are defined in a states-object, which is considered to be a **single source of truth**. Calling a valid transition changes the state, which means routing to the equivalent path of the next state. Each state should have a path representation in the routes array of your router instance. 

- Control applications routes by state management
- States-object as single source of truth
- Avoid inconsistent states after URL/History Navigation**

**vue-route-state** adds a StateMachine module into the VUEX store, which exposes the function `'transitNextState'` to change from current state(route) to next state(route), by making a transition. Any transition must correspond to your current state. You can leave the current state(route) only by making a valid transition. All states and transititons are in states.js defined. 

If you are not comfortable with State-Machines, I would recommend you to read the excellent Blog from **Krasimir Tsonev** on which this code is based on.

http://krasimirtsonev.com/blog/article/managing-state-in-javascript-with-state-machines-stent

StateMachine accepts an input and based on that input plus the current state decides what will be the next state. When the machine changes its state we say that it transits to a new state.

> Current State -> `VALID Transition` -> New State
>
> Current State -> `INVALID Transition` -> Current State (`unchanged`)

Walking through the browser history or changing the ULR has no (side)effekt, because you must use a valid transistion according to your current state to change anything. `Navigation by history or URL will be blocked` to avoid inconsistent states

> Current State -> HISTORY/URL Navigation -> Current State (`unchanged`)
## Example
Change directory to example and start with  
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```
## Usage
This project is based on VUE including VUEX and VUE-Router. 

``` bash
# works only with vue-router >= 2.0
npm install vue-route-state
```
**Import 'vue-route-state'**
``` js
// main.js
import store from './store' // VUEX store instance
import router from './router' // vue-router instance

import stateMachine from 'vue-route-state'
import states from './states'

stateMachine(store, router, states)  
// // ... if wanted get an unregister function for your store modul
// const unregister = stateMachine(store, router, states)   

// bootstrap your app...
import App from './pages/App'

let vm = new Vue({
  router,
  store,
  el: '#main',
  render: h => h(App),
})
```
**Definition of `states` and `transitions`**

States.js contains all states and transitions. This Definition is the **single source of truth**. Representing all available states and their transitions to other states of your application. Changing a state by transition, routes to a matching route and displays a Vue-Page    

``` js
// states.js  ->  import states from './states'
export default {
  states:{ 
    auth:{                  // state
      success: 'profile',   // transition: 'next state'
      // transition 'success' changes state 'auth' to next state 'profile'
      failure: 'failure',   
    },
    profile: {
      logout: 'auth',
      fetch: 'userlist'
    }  
    userlist: {
      back: 'profile'
    }
    failure: {
      logout: 'auth'
    }
  }      
}   
```
**Definition of `routes` in your instance of router**

Any valid transition routes to the next state, which must be defined as path or as meta:{state} in a route 

Each  state in states.js like 'auth', 'profile' or 'userlist' should have a matching route representation like {path: '/auth',...} in routes array.

```js
// ./router/index.js -> import router from './router'
import Vue from 'vue'
import Router from 'vue-router'

import Auth from '../pages/Auth'
import User from '../pages/User'
import UserList from '../pages/UserList'
import Failure from '../pages/Failure'

Vue.use(Router)

let router = new Router({
  routes: [
    {path:'/auth', component:Auth },  // matches state 'auth' using path '/auth'
    // {path:'/login', meta:{state:'auth'}, component:Auth } 
    // matches state 'auth' using path 'login'
    {path:'/profile', component:User },
    {path:'/userlist', component:UserList },
    {path:'/failure', component:Failure },
  ],
})
export default router
```
**Inside your VUE-component you can `change the state, by making a transition.`**
``` js
this.$store.state.stateMachineModul.transitNextState('success')  
```
**Component `Auth.vue` using `.transitNextState`**  
``` js
...
<script>
  export default {
    methods:{
     async login(){
        try {
          // fetch and await data ... 
          this.$store.state.stateMachineModul.transitNextState('success')
        } catch (error) {
          this.$store.state.stateMachineModul.transitNextState('failure')          
        }
      }
    }
  }
<script>
```

## States & Transitions

The current state `'auth'` has two valid transitions `'success' & 'failure'`. Using transition `'success'` would change state to `'profile'` and routes to `'/profile'`

Walking from 'auth' to next state 'profile' by calling a transition
``` js
// STATE AUTH -> STATE PROFILE
store.state.stateMachineModul.transitNextState('success') 
```

Now current state is `'profile'` and only the valid transition `'logout'` would change state to `'auth'` back and routes to `'/auth'`. 

Going back to '/auth' by **History/URL** is blocked. You can **not** leave 'profile' this way, but you can change to 'auth' by calling the right transition 'logout'. 
``` js
// STATE PROFILE -> STATE AUTH 
store.state.stateMachineModul.transitNextState('logout') 
```

A walk to another Vue-Page **must use a valid transition** according to your current state. This behaviour avoids inconsistent states.


## Details

### Configuration
```js
// states.js  ->  import states from './statemachine/states'
export default {

  config:{
    moduleName:'stateMachineModul', // undefined defaults to stateMachineModul
    initialState: 'auth', // undefined defaults to first property in states ('auth')
    debug: (s) => console.log(s), // callback || true (=> log current state to console)  
    storageKey = 'router-statemachine', // undefined defaults to 'router-statemachine' 
    storageTypeSession: true, // undefined defaults to LocalStorage    
  },

  states:{ 
    auth: {
      success: 'profile',
      failure: 'failure',
    }
    // ...
  }     
}
```
### Use VUEX Actions
You can use use native `VUEX actions` instead of exposed .transitNextState() 
``` js
store.dispatch(`stateMachineModul/stateMachineNext`, 'success')
// is ident to 
store.state.stateMachineModul.transitNextState('success') 
```

### Transfer Data
Note that you can `transfer some data` to next state, replacing transition string by an object  
```js
// object: {transition:'success', data:{foo:'foo'} }
store.state.stateMachineModul.transitNextState({transition:'success', data:{foo:'foo'} }) 
// string: 'success'
store.state.stateMachineModul.transitNextState('success') 
```

### Work with State independent Path
Using a `meta:{state}` object makes your path from state independent.
```js
  // matching state 'auth' routes to path '/auth' 
  {path:'/auth', name:'Login', component: Auth },
  
  // matching state 'auth' routes to path '/login'
  {path:'/login', meta:{state:'auth'}, name:'Login', component:Auth },
```
 
### Get State Object 

Get current state by using `computed property` with exposed `stateMachineModul.getState()` and get transition, last and current state including current path, next valid transitions and transfer data.
```js
export default {
  ...
  computed: {      
    geState: function(){return this.$store.state.stateMachineModul.getState()}
    // is ident to this.$store.state.stateMachineModul.stateMachine.current
  },
  ..
}

/* Output store.state.stateMachineModul.getState()
  {
    lastState: "auth", 
    transition: "success", 
    state: "profile",    // 'A'  -  route:{path:'/B', meta:{state:'A'}, ... }
    path: "/profile",    // '/B' -  route:{path:'/B', meta:{state:'A'}, ... }
    nextTransitions: {
      logout: 'auth',
      fetch: 'userlist'
    }, 
    data: {foo:'foo'}  
  }
*/
```  

## License

[MIT](http://opensource.org/licenses/MIT)
