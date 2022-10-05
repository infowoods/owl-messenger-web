import toast from 'react-hot-toast'

import { logout, toLogin } from './loginUtil'

export function handelOwlApiError(error, t, curLogin) {
  if (error.action === 'logout') {
    toast.loading(t('login_first'))
    logout()
    curLogin.token = null
    curLogin.user = null
    curLogin.group = null

    toLogin()
  } else {
    toast.error(`${error.code} ${error.message}`, { duration: 2000 })
  }
}
