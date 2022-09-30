import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { logout, toLogin } from '../../utils/loginUtil'
import { getSubscriptions, unsubscribeChannel } from '../../services/api/owl'
import { copyText } from '../../utils/copyUtil'

import { getUserWallets } from '../../services/api/owl'

import Icon from '../../widgets/Icon'
import Collapse from '../../widgets/Collapse'
import Loading from '../../widgets/Loading'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const TopUpSheet = dynamic(() => import('./TopUpSheet'))
const Wallets = dynamic(() => import('./Wallets'))

import styles from './index.module.scss'

// TODO: 改版，将 User 页改成用户内容的索引页，索引卡片。
//  点击卡片进入到子页（子页进行实际内容的加载和展示）
//  子页：我的钱包/余额，我的账单，我的订阅，订阅历史

function User() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [inProcessOfTopUp, setInProcessOfTopUp] = useState(false)

  function useMyWallets() {
    const { data, error, mutate } = useSWR('me?wallets', getUserWallets)
    if (error) {
      handelOwlApiError(error)
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

  function handelOwlApiError(error) {
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

  function useMySubscriptions() {
    const { data, error } = useSWR('subscriptions?enabled', getSubscriptions)
    if (error) {
      if (error) {
        handelOwlApiError(error)
      }
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
    }
  }

  function toUnsubscribeChannel(event, t, channel_id) {
    // event.target.innerHTML = t('unsubscribing')
    event.target.innerHTML = t('unsubscribing')

    event.target.disabled = true

    const card = document.querySelector(`div[data_id='${channel_id}']`)

    unsubscribeChannel(channel_id)
      .then(() => {
        toast.success(t('unsubscribe_success'))
        card.style.display = 'none'
      })
      .catch((error) => {
        if (error) {
          handelOwlApiError(error)
        }
        event.target.disabled = false
      })
  }

  const myWallets = useMyWallets()
  const mySubscriptions = useMySubscriptions()

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('my_balances')}</p>
      <Wallets
        t={t}
        toast={toast}
        myWallets={myWallets}
        handelOwlApiError={handelOwlApiError}
        setInProcessOfTopUp={setInProcessOfTopUp}
      ></Wallets>

      <p className={styles.sectionTitle}># {t('my_subscription')}</p>
      {mySubscriptions.isLoading && (
        <Loading size={40} className={styles.loading} />
      )}
      {mySubscriptions.data && (
        <>
          {!mySubscriptions.data?.subscriptions && (
            <div className={styles.empty}>
              <Icon type="ufo" />
              <p>{t('no_records')}</p>
            </div>
          )}
          {mySubscriptions?.data?.subscriptions?.length > 0 &&
            mySubscriptions.data.subscriptions.map((item, index) => {
              return (
                <Collapse
                  className={styles.channelCard}
                  title={item.channel.title}
                  key={item.channel.id}
                  data_id={item.channel.id}
                >
                  <>
                    {item.channel.description && (
                      <p className={styles.feedDesc}>
                        <span>
                          {t('desc')}
                          {t('colon')}
                        </span>
                        {item.channel.description}
                      </p>
                    )}
                    <div className={styles.copy}>
                      <p>
                        <span>
                          {t('channel_uri')}
                          {t('colon')}
                        </span>
                        <span
                          onClick={() => copyText(item.channel.uri, toast, t)}
                        >
                          {item.channel.uri} <Icon type="copy" />
                        </span>
                      </p>
                    </div>
                    <div
                      className={`${styles.detail} ${styles.increaseMargin}`}
                    >
                      <button
                        className={styles.button}
                        onClick={(event) => {
                          toUnsubscribeChannel(event, t, item.channel.id, index)
                        }}
                      >
                        {t('unsubscribe')}
                      </button>
                    </div>
                  </>
                </Collapse>
              )
            })}
        </>
      )}

      {/* 充值组件 */}
      {inProcessOfTopUp && (
        <TopUpSheet
          t={t}
          toast={toast}
          myWallets={myWallets}
          handelOwlApiError={handelOwlApiError}
          setInProcessOfTopUp={setInProcessOfTopUp}
        />
      )}

      <OwlToast />
    </div>
  )
}

export default User
