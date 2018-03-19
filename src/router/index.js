import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/user/Login'
import Home from 'components/container/Home'
import Container from 'components/container/Container'
import Dtmgr from 'components/layout/Dtmgr'
import Audit from 'components/mgrsrc/Audit'
import Apply from 'components/mgrsrc/Apply'
import Logmgr from 'components/mgrsrc/Logmgr'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/man',
      component: Container,
      children: [
        {
          path: 'home',
          component: Home
        },
        {
          path: 'dtmgr',
          component: Dtmgr,
          children: [
            {
              path: 'auditmgr/:type',
              component: Audit
            },
            {
              path: 'applymgr',
              component: Apply
            },
            {
              path: 'logmgr',
              component: Logmgr
            }
          ]
        }
      ]
    }
  ]
})
