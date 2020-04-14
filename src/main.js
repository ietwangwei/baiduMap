import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import $http from './services/queryService'
import $nav from './utils/nav'
import GlobalLoading from './utils/globalLoading'
import BaiduMap from 'vue-baidu-map'

import './styles/'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use($http)
Vue.use($nav)
Vue.use(BaiduMap, {
  ak: 'PvuZYQ8BGMIEgq9fsVrM246Qn9gSFcDg'
})
Vue.prototype.$globalLoading = GlobalLoading

console.log('test console')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
