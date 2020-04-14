import { Loading } from 'element-ui'

class GlobalLoading {
  load = null
  static start (message) {
    this.load = Loading.service({
      fullscreen: true,
      text: message || '正在加载，请稍等...'
    })
  }
  static close () {
    this.load && this.load.close()
  }
}

export default GlobalLoading
