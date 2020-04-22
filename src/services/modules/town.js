import httpService from '../httpService'
import { town } from '../urlConst'

export const getRange = () => {
  return httpService({
    method: 'get',
    url: town.getRange
  })
}

export const getCovers = (data) => {
  return httpService({
    method: 'get',
    url: town.getCovers
  })
}

export const saveRange = (data) => {
  return httpService({
    method: 'post',
    url: town.saveRange,
    data
  })
}

export const saveCovers = (data) => {
  return httpService({
    method: 'post',
    url: town.saveCovers,
    data
  })
}
