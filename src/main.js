import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import $http from './services/queryService'
import $nav from './utils/nav'
import GlobalLoading from './utils/globalLoading'
import AMap from 'vue-amap'
import 'lib-flexible/flexible'
import './styles/'
Vue.use(AMap)

// 初始化vue-amap
AMap.initAMapApiLoader({
  // 高德key
  key: 'f5212b377b6543983c0aa63d3c3af1fd',
  // 插件集合 （插件按需引入）
  plugin: [
    'AMap.Autocomplete', // 输入提示插件
    'AMap.PlaceSearch', // POI搜索插件
    'AMap.Scale', // 右下角缩略图插件 比例尺
    'AMap.OverView', // 地图鹰眼插件
    'AMap.ToolBar', // 地图工具条
    'AMap.MapType', // 类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
    'AMap.PolyEditor', // 编辑 折线多边形
    'AMap.CircleEditor', // 圆形编辑器插件
    'AMap.Geolocation' // 定位控件，用来获取和展示用户主机所在的经纬度位置
  ],
  uiVersion: '1.0.11'
})

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use($http)
Vue.use($nav)
Vue.prototype.$globalLoading = GlobalLoading

console.log('test console')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
