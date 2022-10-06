import { MIXIN_OAUTH_HOST } from '../../constants'

const crypto = require('crypto')

class OAuth {
  sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest()
  }

  base64URLEncode(str) {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  requestCode(pkce = false, state = '') {
    if (pkce) {
      this.requestCodePkce(state)
    } else {
      this.requestCodeServe(state)
    }
  }

  requestCodePkce(state) {
    // const randomCode = crypto.randomBytes(32)
    // const verifier = this.base64URLEncode(randomCode)
    // const challenge = this.base64URLEncode(this.sha256(randomCode))
    // let url = `${MIXIN_OAUTH_HOST}/oauth/authorize?client_id=${process.env.MIXIN_CLIENT_ID}&scope=PROFILE%3AREAD&code_challenge=${challenge}`
    let url = `${MIXIN_OAUTH_HOST}/oauth/authorize?client_id=${process.env.MIXIN_CLIENT_ID}&scope=PROFILE%3AREAD`
    if (state) {
      const str = encodeURIComponent(JSON.stringify(state))
      url += `&state=${str}`
    }
    window.location.href = url
  }

  requestCodeServe(state) {
    let url = `${MIXIN_OAUTH_HOST}/oauth/authorize?client_id=${process.env.MIXIN_CLIENT_ID}&response_type=code&scope=PROFILE%3AREAD`
    if (state) {
      const str = encodeURIComponent(JSON.stringify(state))
      url += `&state=${str}`
    }
    window.location.href = url
  }
}

export default new OAuth()
