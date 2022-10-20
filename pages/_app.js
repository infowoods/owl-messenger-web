import { useReducer, useState } from 'react'
import dynamic from 'next/dynamic'
import { NextUIProvider, createTheme } from '@nextui-org/react'
import { appWithTranslation } from 'next-i18next'
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

const darkTheme = createTheme({
  type: 'dark',
  theme: {},
})

const lightTheme = createTheme({
  type: 'light',
  theme: {},
})

const TopProgressBar = dynamic(
  () => {
    return import('../components/TopProgressBar')
  },
  { ssr: false }
)

function MyApp({ Component, pageProps }) {
  const loginData = useReducer(loginDataReducer, LoginData)
  const [activeTheme, setActiveTheme] = useState('light')

  return (
    <>
      <NextUIProvider theme={activeTheme === 'dark' ? darkTheme : lightTheme}>
        <TopProgressBar />
        <CurrentLoginContext.Provider value={loginData}>
          <Layout setActiveTheme={setActiveTheme}>
            <Component {...pageProps} />
          </Layout>
        </CurrentLoginContext.Provider>
      </NextUIProvider>
    </>
  )
}

export default appWithTranslation(MyApp, i18nConfig)
