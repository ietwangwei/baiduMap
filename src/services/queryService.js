import Vue from 'vue'
import * as users from './modules/users'

const install = () => {
  Vue.prototype.$http = {
    ...users
  }
}

export default install
