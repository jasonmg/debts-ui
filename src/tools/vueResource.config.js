import Vue from 'vue'
import VueResource from 'vue-resource'

import { Loading } from 'element-ui';

Vue.use(VueResource)

Vue.http.options.root = 'http://localhost:8081'
Vue.http.options.timeout = 5000

Vue.http.interceptors.push((request, next) => {
    const loadingConfig = {
        fullscreen: true,
        lock: true,
        text: '正在请求中，请稍后……'
    }
    let loadingInstance = Loading.service(loadingConfig)
    next(response => {
        loadingInstance.close()
        // 根据请求的状态，response参数会返回给successCallback或errorCallback
        return response
    })
})
