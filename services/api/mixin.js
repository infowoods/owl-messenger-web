import http from '../../services/http/mixin'
import StorageUtil from '../../utils/storageUtil'

export async function getAccessToken(code) {
  // const verifier = localStorage.getItem('code-verifier')
  const data = {
    client_id: process.env.MIXIN_CLIENT_ID,
    code,
    client_secret: process.env.MIXIN_SECRET_KEY,
    // code_verifier: verifier,
  }
  const res = await http.post('/oauth/token', { data })
  if (res?.access_token) {
    return res.access_token
  }
}

export function getUser(id) {
  return http.get(`/users/${id}`)
}

export function getProfile() {
  return http.get('/me')
}

/**
 *
 * @param {conversation_id} String
 * @returns
 * 判断是否群组
 */
export function checkGroup(id) {
  return http.get(`/conversations/${id}`)
}

export function loginFunc(token) {
  StorageUtil.set('mixin_token', token)
}

export function getMixinContext() {
  let ctx = {}
  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.MixinContext
  ) {
    ctx = JSON.parse(prompt('MixinContext.getContext()'))
    ctx.platform = ctx.platform || 'iOS'
  } else if (
    window.MixinContext &&
    typeof window.MixinContext.getContext === 'function'
  ) {
    ctx = JSON.parse(window.MixinContext.getContext())
    ctx.platform = ctx.platform || 'Android'
  }
  return ctx
}

export function reloadTheme(platform) {
  switch (platform) {
    case 'iOS':
      window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.reloadTheme &&
        window.webkit.messageHandlers.reloadTheme.postMessage('')
      return
    case 'Android':
    case 'Desktop':
      window.MixinContext &&
        typeof window.MixinContext.reloadTheme === 'function' &&
        window.MixinContext.reloadTheme()
      return
  }
}
