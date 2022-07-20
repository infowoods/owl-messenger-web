import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { i18n, useTranslation } from 'next-i18next'
import Head from 'next/head'

import TopBar from '../TopBar'

import Avatar from '../../widgets/Avatar'
import Icon from '../../widgets/Icon'
import Loading from '../../widgets/Loading'
import BottomNav from '../../widgets/BottomNav'

import { ProfileContext } from '../../stores/useProfile'

import { getMixinContext, reloadTheme } from '../../services/api/mixin'
import { checkGroup } from '../../services/api/owl'

import storageUtil from '../../utils/storageUtil'
import { authLogin } from '../../utils/loginUtil'

import styles from './index.module.scss'

function Layout({ children }) {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const { pathname, push } = useRouter()
  const [theme, setTheme] = useState('')
  const [init, setInit] = useState(false)
  const [platform, setPlatform] = useState(false)
  const isLogin = state.userInfo && state.userInfo.user_name

  const navHref = ['/', '/user']

  const getBarColor = (path) => {
    reloadTheme(platform)
    if (theme === 'dark') {
      return path === '/' ? '#080808' : '#1E1E1E'
    }
    return path === '/' ? '#FFFFFF' : '#F4F6F7'
  }

  const backLink = (path) => {
    switch (path) {
      case '/hot-topics':
        return '/'
      case '/settings':
        return '/user'
      default:
        break
    }
  }

  const avatarLink = (path) => {
    switch (path) {
      case '/':
      case '/hot-topics':
        return '/user'
      default:
        break
    }
  }

  const handleClick = () => {
    const link = avatarLink(pathname)
    if (link) {
      push(avatarLink(pathname))
    } else {
      return
    }
  }

  useEffect(() => {
    console.log('>>> layout init:', pathname)
    const ctx = getMixinContext()
    ctx.appearance &&
      document.documentElement.setAttribute('data-theme', ctx.appearance)
    setTheme(ctx.appearance || 'light')

    if (
      ctx?.locale &&
      ctx.locale !== 'zh-CN' &&
      i18n.language !== 'en' &&
      pathname !== '/callback/mixin'
    ) {
      i18n.changeLanguage('en')
      push(pathname, pathname, { locale: 'en' })
      return
    }

    if (!ctx?.app_version) {
      storageUtil.set('platform', 'browser')
    }
    ctx?.platform && setPlatform(ctx?.platform)

    storageUtil.get(`user_info_${ctx?.conversation_id || ''}`) &&
      dispatch({
        type: 'userInfo',
        userInfo: storageUtil.get(`user_info_${ctx?.conversation_id || ''}`),
      })

    storageUtil.set('current_conversation_id', ctx?.conversation_id || null)

    if (ctx?.conversation_id) {
      const initialFunc = async () => {
        const localGroupInfo = storageUtil.get(
          `group_info_${ctx?.conversation_id || ''}`
        )
        if (localGroupInfo) {
          dispatch({
            type: 'groupInfo',
            groupInfo: localGroupInfo,
          })
          setInit(true)
        } else {
          const data = await checkGroup({
            conversation_id: ctx.conversation_id,
          })
          if (!data?.err_code) {
            dispatch({
              type: 'groupInfo',
              groupInfo: data,
            })
            setInit(true)
          }
        }
      }
      initialFunc()
    } else {
      setInit(true)
    }
  }, [])

  return (
    <div className={`${styles.wrap} ${pathname !== '/' && styles.bgGray}`}>
      <Head>
        <title>Owl Deliver</title>
        <meta name="description" content="Owl Deliver" />
        <meta name="theme-color" content={getBarColor(pathname)} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {init && pathname !== '/callback/mixin' ? (
        <>
          <TopBar url={backLink(pathname)} />
          <div className={styles.avatarWrap}>
            <div>
              {pathname === '/user' && (
                <Icon type="settings-fill" onClick={() => push('/settings')} />
              )}
              {isLogin ? (
                <div className={styles.avatar}>
                  <Avatar
                    group={state.groupInfo?.is_group}
                    imgSrc={state.userInfo?.user_icon}
                    onClick={handleClick}
                  />
                </div>
              ) : (
                <div className={styles.login} onClick={() => authLogin()}>
                  <span>
                    {state.groupInfo?.is_group ? t('owner_login') : t('login')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <Loading size={36} className={styles.loading} />
        </>
      )}
      <div style={{ opacity: `${init ? '1' : '0'}` }}>
        {children}
        {navHref.includes(pathname) && <BottomNav t={t} isLogin={isLogin} />}
      </div>
    </div>
  )
}

export default Layout
