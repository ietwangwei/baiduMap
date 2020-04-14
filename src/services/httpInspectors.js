import storeService from './storeService'
import { Message } from 'element-ui'

const errorMap = {
  400: {
    msg: '请求参数错误'
  },
  404: {
    msg: '找不到服务地址'
  },
  401: {
    msg: '当前用户没有权限,请重新登录'
  },
  403: {
    msg: '访问被拒绝'
  },
  405: {
    msg: '请求方法错误'
  },
  500: {
    msg: '服务器出现问题'
  }
}

export default class {
  static setConfig (options) {
    var token = storeService.getToken()
    var headers = {
      'token': token
    }
    if (options && options.header) {
      for (let i in options.header) {
        headers[i] = options.header[i]
      }
    }
    return headers
  }

  static responseHandler (res, resolve, reject) {
    if (res.data || res.data.statusCode === 2000) {
      return resolve(res.data)
    } else {
      reject(res.data)
    }
  }

  static errorHandler (error, reject) {
    const status = error.response.status
    if (errorMap[status]) {
      Message.error(errorMap[status].msg)
    } else {
      Message.error('未知错误')
    }
  }
}
