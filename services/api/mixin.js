import http from '../../services/http/mixin'
import { MIXIN_CLIENT_ID, StorageKeys } from '../../constants'
import StorageUtil from '../../utils/storageUtil'

export async function getAccessToken (code) {
  const verifier = localStorage.getItem('code-verifier')
  const data = {
    client_id: MIXIN_CLIENT_ID,
    code,
    code_verifier: verifier
  }
  const res = await http.post('/oauth/token', { data })
  return res.access_token
}

export function getUser (id) {
  return http.get(`/users/${id}`)
}

export function getProfile () {
  return http.get('/me')
}

export function loginFunc (token) {
  StorageUtil.set('mixin_token', token)
}

export function getMixinContext () {
  let ctx = {}
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
    ctx = JSON.parse(prompt('MixinContext.getContext()'))
    ctx.platform = ctx.platform || 'iOS'
  } else if (window.MixinContext && (typeof window.MixinContext.getContext === 'function')) {
    ctx = JSON.parse(window.MixinContext.getContext())
    ctx.platform = ctx.platform || 'Android'
  }
  return ctx
}
