import httpService from '../httpService'
import { users } from '../urlConst'

export const login = (data) => {
  return httpService({
    method: 'get',
    url: users.login,
    data
  })
}
