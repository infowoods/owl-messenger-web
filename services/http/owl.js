import axios from 'axios'
import { getToken } from '../../utils/loginUtil'

const OWL_API_HOST = 'https://api.infowoods.com/v3'

const owlrss = axios.create({
  baseURL: OWL_API_HOST,
  timeout: 15000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

owlrss.interceptors.request.use(
  async (configs) => {
    const token = await getToken(configs)
    if (token) {
      configs.headers.Authorization = `Bearer ${token}`
    }
    return configs
  },
  (_) => {}
)

// err handler
owlrss.interceptors.response.use(
  (res) => {
    // res: config, data, headers, status, statusText
    // res.data: message
    if (!res.data) {
      return Promise.reject({ code: -1 })
    }
    if (res.data.error) {
      const error = res.data.error
      if (error.code === (401 || 403)) {
        return Promise.reject({ code: error.code })
      }
      return Promise.reject({ code: error.code, message: error.description })
    }
    if (res.status === 403 || res.status === 401) {
      return Promise.reject({
        action: 'logout',
        status: res.status,
        data: res.data,
      })
    }
    if (res.status === 202) {
      return Promise.reject({ status: res.status, data: res.data })
    } else {
      return Promise.resolve(res.data)
    }
  },
  (err) => {
    // err.response: config, data, headers, status, statusText
    if (err.response.status === 403 || err.response.status === 401) {
      return Promise.reject({
        action: 'logout',
        status: err.response.status,
        data: err.response.data,
      })
    }
    if (err.response && err.response.data) {
      return Promise.reject(err.response.data)
    } else {
      return Promise.reject({ code: -1 })
    }
  }
)

async function request(options) {
  const res = await owlrss.request(options)
  return Promise.resolve(res.data)
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
