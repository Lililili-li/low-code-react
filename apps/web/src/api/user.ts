import request from '@repo/shared/request'

export interface LoginParams {
  account: string
  password: string
}

const login = (data: LoginParams ) => {
  return request.post('/auth/login', data)
}

export default {
  login
}