import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { i18n, useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import TopBar from '../TopBar'
import BottomNav from '../../widgets/BottomNav'

import { CurrentLoginContext } from '../../contexts/currentLogin'
import { getMixinContext, reloadTheme } from '../../utils/pageUtil'
import { APPS } from '../../constants'
import { loadToken, loadUserData, loadGroupData } from '../../utils/loginUtil'

const AppsJumper = dynamic(() => import('./AppsJumper'))

import styles from './index.module.scss'

function Layout({ setActiveTheme, children }) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [ctx, setCtx] = useState({})

  const [showApps, setShowApps] = useState(false)
  const [barColor, setBarColor] = useState('transparent') //#999999
  const navHref = APPS[APPS.current].bottom_nav_href

  const backPath = (curPath) => {
    if (curPath.startsWith('/user/') && curPath.length > 6) {
      return '/user'
    } else if (curPath.startsWith('/channels/') && curPath.length > 10) {
      return '/'
    }
  }

  useEffect(() => {
    const ctx = getMixinContext()
    setCtx(ctx)

    const updateTheme = () => {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        const clr = '#080808'
        document
          .querySelector("meta[name='theme-color']")
          .setAttribute('content', clr)

        setActiveTheme('dark')
        // hack for next-org-ui bug
        document.documentElement.setAttribute('style', 'color-scheme:dark;')

        setBarColor(clr)
      } else {
        const clr = '#FFFFFF'
        document
          .querySelector("meta[name='theme-color']")
          .setAttribute('content', clr)

        setActiveTheme('light')
        // hack for next-org-ui bug
        document.documentElement.setAttribute('style', 'color-scheme:light;')
        setBarColor(clr)
      }
      reloadTheme()
    }

    // To watch for theme changes:
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', async (event) => {
        updateTheme()
      })

    updateTheme()

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
  }, [curLogin, router, setActiveTheme])

  return (
    <>
      <div className={`${styles.wrap}`}>
        <Head>
          <title>{t(APPS[APPS.current].title)}</title>
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,minimum-scale=1, maximum-scale=1, user-scalable=no"
          />
          <meta
            name="description"
            content={t(APPS[APPS.current].description)}
          />
          <meta name="theme-color" content={barColor} />
          <link rel="icon" href="/favicon.png" />
        </Head>

        {router.pathname !== '/callback/mixin' && (
          <TopBar
            ctx={ctx}
            t={t}
            curLogin={curLogin}
            backPath={backPath(router.pathname)}
            showApps={showApps}
            setShowApps={setShowApps}
          />
        )}

        {children}

        {router.pathname !== '/callback/mixin' && (
          <>
            {navHref.includes(router.pathname) && (
              <BottomNav ctx={ctx} t={t} curLogin={curLogin} />
            )}

            <AppsJumper
              ctx={ctx}
              t={t}
              showApps={showApps}
              setShowApps={setShowApps}
            />
          </>
        )}
      </div>
    </>
  )
}

export default Layout
