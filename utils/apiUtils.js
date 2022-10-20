import toast from 'react-hot-toast'
import { getMixinContext } from './pageUtil'
import { logout, toLogin } from './loginUtil'
import { isProduct } from '../constants'

export function handleInfowoodsApiError(error, t, curLogin) {
  if (error.action === 'logout') {
    toast.loading(t('login_first'))
    const ctx = getMixinContext()
    logout(ctx.conversation_id)
    curLogin.token = null
    curLogin.user = null
    curLogin.group = null

    toLogin()
  } else {
    if (!isProduct) {
      console.log('error :>> ', error)
    }
    const msg = `${error.code} ${error.message}`
    toast.error(msg, { duration: 4500 })
    return msg
  }
}
