'use strict'

import http from '../../services/http/mixin'

export const mixinApi = {
  getAccessToken: async function getAccessToken(code) {
    // const verifier = localStorage.getItem('code-verifier')
    const data = {
      client_id: process.env.MIXIN_CLIENT_ID,
      code: code,
      client_secret: process.env.MIXIN_SECRET_KEY,
      // code_verifier: verifier,
    }
    const rsp = await http.post('/oauth/token', { data })
    if (rsp?.access_token) {
      return rsp.access_token
    }
  },
  getUser: function (id) {
    return http.get(`/users/${id}`)
  },
  getProfile: function () {
    return http.get('/me')
  },
}
