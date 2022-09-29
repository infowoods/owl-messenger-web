import { useReducer } from 'react'
import { appWithTranslation } from 'next-i18next'

import {
  CurrentLoginContext,
  LoginData,
  loginDataReducer,
} from '../contexts/currentLogin'
import '../styles/globals.scss'
import '../styles/themes.scss'
const i18nConfig = require('../next-i18next.config')
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {
  const loginData = useReducer(loginDataReducer, LoginData)

  return (
    <CurrentLoginContext.Provider value={loginData}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CurrentLoginContext.Provider>
  )
}

export default appWithTranslation(MyApp, i18nConfig)
