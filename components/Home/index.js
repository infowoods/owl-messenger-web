import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useContext, useState } from 'react'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'

import { getMixinContext } from '../../utils/pageUtil'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const Toast = dynamic(() => import('../../widgets/Toast'))

const UriParsing = dynamic(() => import('./UriParsing'))

import UriSample from './UriSample'

import styles from './index.module.scss'

function Home() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [ctx, setCtx] = useState({})
  useEffect(() => {
    const ctx = getMixinContext()
    setCtx(ctx)
  }, [])

  return (
    <div className={styles.main}>
      <>
        <UriParsing ctx={ctx} t={t} curLogin={curLogin} />

        <UriSample ctx={ctx} t={t} curLogin={curLogin} />

        <div className={styles.intro_to_discovery}>
          <a
            onClick={() => {
              if (curLogin.token) router.push('/discovery')
              else {
                toast(t('login_first'), { icon: '💁' })
                return
              }
            }}
          >
            {t('intro_to_discovery')} &#8594;
          </a>
        </div>
      </>

      <Toast />
    </div>
  )
}

export default Home
