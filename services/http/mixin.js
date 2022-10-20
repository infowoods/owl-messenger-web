'use strict'

import axios from 'axios'
const BASE_URL = 'https://api.mixin.one'
const CN_BASE_URL = 'https://mixin-api.zeromesh.net'

// import { getMixinContext } from '../../utils/pageUtil'

// function is_use_chinese() {
//   let ctx = getMixinContext()
//   if (ctx) {
//     if (ctx?.locale?.toLowerCase() === 'zh-cn') {
//       return true
//     }
//     if (ctx?.currency?.toUpperCase() === 'CNY') {
//       return true
//     }
//   }
//   return false
// }
function get_api_base_url() {
  return CN_BASE_URL
  // if (is_use_chinese()) {
  //   return CN_BASE_URL
  // } else {
  //   return BASE_URL
  // }
}

const session = axios.create({
  timeout: 15000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

session.interceptors.request.use(
  async (configs) => {
    if (configs.url !== '/oauth/token') {
      configs.headers.Authorization = `Bearer ${token}`
    }
    configs.baseURL = get_api_base_url()
    return configs
  },
  (_) => {}
)

session.interceptors.response.use(
  (rsp) => {
    if (!rsp.data) {
      return Promise.reject({ code: -1 })
    }
    if (rsp.data.error) {
      const error = rsp.data.error
      if (error.code === (401 || 403)) {
        return Promise.reject({ code: error.code })
      }
      return Promise.reject({ code: error.code, message: error.description })
    } else {
      return Promise.resolve(rsp.data)
    }
  },
  (err) => {
    if (err.response && err.response.data) {
      return Promise.reject(err.response.data)
    } else {
      return Promise.reject({ code: -1 })
    }
  }
)

async function request(options) {
  const rsp = await session.request(options)
  return Promise.resolve(rsp.data)
}

const http = {
  get: (url, options = {}) => {
    const config = {
      url,
      method: 'get',
      ...options,
    }
    return request(config)
  },

  post: (url, options = {}) => {
    const config = {
      url,
      method: 'post',
      ...options,
    }
    return request(config)
  },
}

export default http
