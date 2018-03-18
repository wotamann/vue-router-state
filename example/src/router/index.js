import Vue from 'vue'
import Router from 'vue-router'

import Login from '../pages/Login'
import Profile from '../pages/Profile'
import ProfileDetail from '../pages/ProfileDetail'
import Failure from '../pages/Failure'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {path: '/login', meta:{state:'auth'}, name: 'Login', component: Login },
    {path: '/profile', name: 'Profile', component: Profile },
    {path: '/detail', meta:{state:'profileDetail'}, name: 'ProfileDetail', component: ProfileDetail },
    {path: '/failure', name: 'Failure', component: Failure },
  ],
})
