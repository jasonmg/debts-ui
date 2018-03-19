import Vue from 'vue'
import App from './App'
import router from './router/index'

import $ from 'jquery'
import './assets/css/bootstrap.css'
import './assets/js/bootstrap.js'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

import VueMoment from 'vue-moment'

Vue.use(ElementUI)
Vue.use(VueMoment)

import './tools/vueResource.config' // 引入vue-resource，并配置相关选项

// Vue.prototype.HOST = '/api'
Vue.config.productionTip = false

Vue.prototype.$bus = new Vue()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
