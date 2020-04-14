import axios from 'axios'
import httpInspectors from './httpInspectors'

const httpService = ({ method, url, queryParams, data, options }) => {
  let headers = httpInspectors.setConfig(options)
  let promise = axios({
    headers: headers,
    method: method,
    url: url,
    params: queryParams,
    data: data
  })
  return new Promise((resolve, reject) => {
    return promise.then(res => {
      httpInspectors.responseHandler(res, resolve, reject)
    }, error => {
      httpInspectors.errorHandler(error, reject)
    })
  })
}

export default httpService
