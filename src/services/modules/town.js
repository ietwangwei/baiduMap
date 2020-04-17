import httpService from '../httpService'
import { town } from '../urlConst'

export const getRange = () => {
  return httpService({
    method: 'get',
    url: town.getRange
  })
}

export const saveRange = (data) => {
  return httpService({
    method: 'post',
    url: town.saveRange,
    data
  })
}
