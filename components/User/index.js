import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { TbMailbox } from 'react-icons/tb'

import { getUserWallets } from '../../services/api/owl'
import { handelOwlApiError } from '../../utils/apiUtils'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const SubPageCard = dynamic(() => import('../../widgets/SubPageCard'))
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const TopUpSheet = dynamic(() => import('./TopUpSheet'))
const Wallets = dynamic(() => import('./Wallets'))

import styles from './index.module.scss'
import { logout } from '../../utils/loginUtil'

function User() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [inProcessOfTopUp, setInProcessOfTopUp] = useState(false)
  const router = useRouter()

  function useMyWallets() {
    const { data, error, mutate } = useSWR('me?wallets', getUserWallets)
    if (error) {
      handelOwlApiError(error, t, curLogin)
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
      refresh: () => {
        mutate('me?wallets')
      },
    }
  }

  const myWallets = useMyWallets()

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('my_balances')}</p>
      <Wallets
        t={t}
        toast={toast}
        myWallets={myWallets}
        setInProcessOfTopUp={setInProcessOfTopUp}
      ></Wallets>

      <SubPageCard
        LeftIcon={TbMailbox}
        title={t('my-subscriptions')}
        path={'/user/subscriptions'}
      ></SubPageCard>

      <SubPageCard
        LeftIcon={TbMailbox}
        title={t('old-ver-subs')}
        path={'/user/old-ver-subs'}
      ></SubPageCard>

      <div className={styles.logout}>
        <span
          onClick={() => {
            logout()
            window.location.href = '/'
          }}
        >
          {t('logout')}
        </span>
      </div>

      {/* 充值组件 */}
      {inProcessOfTopUp && (
        <TopUpSheet
          t={t}
          toast={toast}
          myWallets={myWallets}
          handelOwlApiErrorP={(error) => {
            handelOwlApiError(error, t, curLogin)
          }}
          setInProcessOfTopUp={setInProcessOfTopUp}
        />
      )}

      <OwlToast />
    </div>
  )
}

export default User
