import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { i18n, useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))

import { CurrentLoginContext } from '../../contexts/currentLogin'
import { getMixinContext } from '../../utils/pageUtil'
import { owlSignIn } from '../../services/api/owl'
import { mixinApi } from '../../services/api/mixin'

import { saveToken, saveUserData } from '../../utils/loginUtil'
import styles from './index.module.scss'
import { APP_NAME } from '../../constants'

function AuthCallback() {
  const { t } = useTranslation('common')
  const [curLogin, loginDispatch] = useContext(CurrentLoginContext)
  const router = useRouter()

  const useQuery = () => {
    const hasQueryParams =
      /\[.+\]/.test(router.route) || /\?./.test(router.asPath)
    const ready = !hasQueryParams || Object.keys(router.query).length > 0
    if (!ready) return null
    return router.query
  }
  const query = useQuery()

  useEffect(() => {
    // login owl with mixin access token
    const ctx = getMixinContext()
    const conversation_id = ctx.conversation_id || ''

    const loginOwl = async (token) => {
      const params = {
        app: APP_NAME,
        mixin_access_token: token,
        conversation_id: conversation_id,
      }
      const data = await owlSignIn(params)

      if (data?.access_token) {
        curLogin.token = data.access_token
        saveToken(conversation_id, data.access_token)

        const user_data = {
          // expiry_time: data.expiry_time,
          user_id: data.user_id,
          user_name: data.user_name,
          avatar: data.avatar,
        }
        curLogin.user = user_data
        saveUserData(conversation_id, user_data)

        if (ctx?.locale && ctx.locale !== 'zh-CN' && i18n.language !== 'en') {
          i18n.changeLanguage('en')
          router.push('/', '/', { locale: 'en' })
        } else {
          router.push('/')
        }
      }
    }

    //
    const getMixinToken_andLoginOwl = async () => {
      const token = await mixinApi.getAccessToken(query.code)
      token && loginOwl(token)
    }

    if (query?.code) {
      getMixinToken_andLoginOwl().catch((err) => {
        console.log('err :>> ', err)
        toast.error(t('login_failed'))
        push('/')
      })
    }
  }, [query])

  return (
    <div className={styles.main}>
      <OwlToast />
    </div>
  )
}

export default AuthCallback
