export default {
  
    config:{
      moduleName:'stateMachineModul', // undefined defaults to stateMachineModul
      debug: (s) => console.log(s), // callback || true (=> log current state to console)  
      // initialState: 'auth', // undefined defaults to first property in states ('auth')
      // storageKey = 'router-statemachine', // undefined defaults to 'router-statemachine' 
      // storageTypeSession: true, // undefined defaults to LocalStorage  
    }, 
    
   states:{ 
     auth: {
       success: 'profile',
       failure: 'failure',
     },           
     profile: {
       detail: 'profileDetail',
       failure: 'failure',
       logout: 'auth'      
     },
     profileDetail: {
      back: 'profile',
      logout: 'auth'      
    },
     failure: {
       reset: 'auth'      
     }
   }  
 }
 