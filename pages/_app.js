import { useReducer } from 'react'
import { appWithTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
const i18nConfig = require('../next-i18next.config')
import {
  CurrentLoginContext,
  LoginData,
  loginDataReducer,
} from '../contexts/currentLogin'
import '../styles/globals.scss'
import '../styles/themes.scss'
import 'nprogress/nprogress.css'

import Layout from '../components/Layout'

const TopProgressBar = dynamic(
  () => {
    return import('../components/TopProgressBar')
  },
  { ssr: false }
)

function MyApp({ Component, pageProps }) {
  const loginData = useReducer(loginDataReducer, LoginData)

  return (
    <>
      <TopProgressBar />
      <CurrentLoginContext.Provider value={loginData}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CurrentLoginContext.Provider>
    </>
  )
}

export default appWithTranslation(MyApp, i18nConfig)
