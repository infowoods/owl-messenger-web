import AuthMixin from './auth/AuthMixin'
import storageUtil from './storageUtil'
import { getProfile } from '../services/api/mixin'

const MIXIN_TOKEN = 'mixin_token'
const OWL_USER = 'user_info_'

export function authLogin() {
  AuthMixin.requestCode(true)
}

export function logout(dispatch) {
  const conversationId = storageUtil.get('current_conversation_id')
  const id = conversationId === null ? '' : conversationId
  dispatch({
    type: 'profile',
    profile: {},
  })
  dispatch({
    type: 'userInfo',
    userInfo: {},
  })
  // dispatch({
  //   type: 'groupInfo',
  //   groupInfo: {},
  // })
  console.log('logout')
  storageUtil.del(OWL_USER + id)
  storageUtil.del('mixin_token')
}

export async function loadAccountInfo(dispatch) {
  const profile = await getProfile()
  dispatch({
    type: 'profile',
    profile,
  })
}

export function saveToken({ token }) {
  storageUtil.set(MIXIN_TOKEN, token)
}

export function getToken() {
  if (process.env.NODE_ENV === 'development' && process.env.TOKEN) {
    return process.env.TOKEN
  }
  const conversationId = storageUtil.get('current_conversation_id')
  const id = conversationId === null ? '' : conversationId
  const token = storageUtil.get(OWL_USER + id)?.access_token
  return token
}
