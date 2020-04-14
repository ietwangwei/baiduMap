import Vue from 'vue'
import vueRouter from '../router'

const install = () => {
  // 本页跳转
  Vue.prototype.$nav = ({ path, name, params }) => {
    vueRouter.$router.push({
      path,
      name,
      params
    })
  }
  // 新标签跳转
  Vue.prototype.$open = ({ path, name, params }) => {
    const { href } = vueRouter.resolve({
      path,
      name,
      params
    })
    window.open(href)
  }
}

export default install
