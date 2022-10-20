import axios from 'axios'
import { getMixinContext } from '../../utils/pageUtil'
import { loadToken } from '../../utils/loginUtil'

const OWL_API_HOST = 'https://api.infowoods.com/v3'

const session = axios.create({
  baseURL: OWL_API_HOST,
  timeout: 15000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

session.interceptors.request.use(
  async (configs) => {
    const ctx = getMixinContext()
    const token = await loadToken(ctx?.conversation_id)
    if (token) {
      configs.headers.Authorization = `Bearer ${token}`
    }
    return configs
  },
  (_) => {}
)

session.interceptors.response.use(
  (res) => {
    // ok response
    // res: config, data, headers, status, statusText
    // console.log('res :>> ', res)
    if (!res.data) {
      return Promise.reject({ code: -1 })
    }
    if (res.status === 202) {
      return Promise.reject({ status: res.status, data: res.data })
    } else {
      return Promise.resolve(res.data)
    }
  },
  (err) => {
    //error response
    if (!err.response) {
      return Promise.reject('error null')
    }
    // err.response: config, data, headers, status, statusText
    const rsp = err.response
    // console.log('error rsp :>> ', rsp)
    if (!rsp.data) {
      return Promise.reject({ code: rsp.status, message: statusText })
    }
    if (!rsp.data.error) {
      if (rsp.status === 401) {
        return Promise.reject({
          action: 'logout',
          status: rsp.status,
          data: rsp.data,
        })
      }

      return Promise.reject({
        code: rsp.status,
        message: 'Invalid request. Maybe invalid path or method.',
      })
    }

    if (rsp.data.error === 'invalid_token') {
      return Promise.reject({
        action: 'logout',
        status: rsp.status,
        data: rsp.data,
      })
    } else {
      return Promise.reject({ code: rsp.status, message: rsp.data.message })
    }
  }
)

async function request(options) {
  const res = await session.request(options)
  return Promise.resolve(res)
}

const http = {
  post: (url, options = {}) => {
    const config = {
      url,
      method: 'post',
      ...options,
    }
    return request(config)
  },

  get: (url, options = {}) => {
    const config = {
      url,
      method: 'get',
      ...options,
    }
    return request(config)
  },

  delete: (url, options = {}) => {
    const config = {
      url,
      method: 'delete',
      ...options,
    }
    return request(config)
  },

  put: (url, options = {}) => {
    const config = {
      url,
      method: 'put',
      ...options,
    }
    return request(config)
  },
}

export default http
