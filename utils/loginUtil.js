import AuthMixin from './auth/AuthMixin'
import storageUtil from './storageUtil'

import { APPS } from '../constants'

function genKey(conversation_id, sub_key = '') {
  if (conversation_id) {
    return `${APPS.current}_login_${conversation_id}_${sub_key}`
  } else {
    return `${APPS.current}_login__${sub_key}`
  }
}

export function toLogin() {
  AuthMixin.requestCode(true)
}

export function logout(conversation_id) {
  storageUtil.del(genKey(conversation_id, 'token'))
  storageUtil.del(genKey(conversation_id, 'user'))
  storageUtil.del(genKey(conversation_id, 'group'))
}

export function saveGroupData(conversation_id, data) {
  storageUtil.set(genKey(conversation_id, 'group'), data)
}

export function loadGroupData(conversation_id) {
  return storageUtil.get(genKey(conversation_id, 'group'))
}

export function saveUserData(conversation_id, data) {
  storageUtil.set(genKey(conversation_id, 'user'), data)
}

export function loadUserData(conversation_id) {
  return storageUtil.get(genKey(conversation_id, 'user'))
}

export function saveToken(conversation_id, token) {
  storageUtil.set(genKey(conversation_id, 'token'), token)
}

export function loadToken(conversation_id) {
  return storageUtil.get(genKey(conversation_id, 'token'))
}
