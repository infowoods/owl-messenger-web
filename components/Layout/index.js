import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { i18n, useTranslation } from 'next-i18next'
import Head from 'next/head'
import TopBar from '../TopBar'
import Avatar from '../../widgets/Avatar'
import Icon from '../../widgets/Icon'
import Loading from '../../widgets/Loading'
import BottomNav from '../../widgets/BottomNav'

import { CurrentLoginContext } from '../../contexts/currentLogin'
import { getMixinContext, reloadTheme } from '../../utils/pageUtil'
import { toLogin } from '../../utils/loginUtil'

import { loadToken, loadUserData, loadGroupData } from '../../utils/loginUtil'

import { APP_NAME, APP_TITLE } from '../../constants'

import styles from './index.module.scss'

function Layout({ children }) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [init, setInit] = useState(false)
  const [theme, setTheme] = useState('')
  const [curLogin, loginDispatch] = useContext(CurrentLoginContext)
  const navHref = ['/', '/discovery', '/user']

  // const getBarColor = (path) => {
  //   reloadTheme()
  //   if (theme === 'dark') {
  //     // return path === '/' ? '#080808' : '#1E1E1E'
  //     return '#080808'
  //   }
  //   // return path === '/' ? '#FFFFFF' : '#F4F6F7'
  //   return '#FFFFFF'
  // }

  const backLink = (path) => {
    switch (path) {
      case '/user/settings':
        return '/user'
      default:
        break
    }
  }

  const avatarLink = (path) => {
    switch (path) {
      case '/user':
        break
      default:
        return '/user'
    }
  }

  const handleAvatarClick = () => {
    const link = avatarLink(router.pathname)
    if (link) {
      router.push(avatarLink(router.pathname))
    } else {
      return
    }
  }

  useEffect(() => {
    console.log('>>> layout init:', router.pathname)
    const ctx = getMixinContext()
    ctx.appearance &&
      document.documentElement.setAttribute('data-theme', ctx.appearance)
    setTheme(ctx.appearance || 'light')

    if (
      ctx?.locale &&
      ctx.locale !== 'zh-CN' &&
      i18n.language !== 'en' &&
      router.pathname !== '/callback/mixin'
    ) {
      i18n.changeLanguage('en')
      router.push(router.pathname, router.pathname, { locale: 'en' })
      return
    }

    if (router.pathname !== '/callback/mixin') {
      curLogin.token = loadToken(ctx?.conversation_id)
      curLogin.user = loadUserData(ctx?.conversation_id)
      curLogin.group = loadGroupData(ctx?.conversation_id)
    }
    setInit(true)
  }, [])

  return (
    <div className={styles.wrap}>
      <Head>
        <title>{t(APP_TITLE)}</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="description" content={t(APP_TITLE)} />
        {/* <meta name="theme-color" content={getBarColor(router.pathname)} /> */}
        <link rel="icon" href="/favicon.png" />
      </Head>

      {router.pathname === '/callback/mixin' ? (
        <>
          <Loading size={36} className={styles.loading} />
        </>
      ) : (
        <>
          <TopBar url={backLink(router.pathname)} />

          <div className={styles.avatarWrap}>
            <div>
              {router.pathname === '/' && (
                <a href="https://mixin.owldeliver.one/">🚪 Old Version</a>
              )}
            </div>

            <div>
              {curLogin?.user ? (
                <div className={styles.avatar}>
                  <Avatar
                    isGroup={curLogin?.group?.is_group}
                    imgSrc={curLogin?.user?.avatar}
                    onClick={() => handleAvatarClick()}
                  />
                </div>
              ) : (
                <>
                  <div className={styles.login} onClick={() => toLogin()}>
                    <span>
                      {curLogin?.group?.is_group
                        ? t('owner_login')
                        : t('login')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {children}
      {navHref.includes(router.pathname) && <BottomNav t={t} />}
    </div>
  )
}

export default Layout
