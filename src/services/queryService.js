import Vue from 'vue'
import * as town from './modules/town'

const install = () => {
  Vue.prototype.$http = {
    town
  }
}

export default install
