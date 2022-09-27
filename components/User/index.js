import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { ProfileContext } from '../../stores/useProfile'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))

import Icon from '../../widgets/Icon'
import Collapse from '../../widgets/Collapse'
import Loading from '../../widgets/Loading'

// TODO: 改版，将 User 页改成用户内容的索引页，索引卡片。
//  点击卡片进入到子页（子页进行实际内容的加载和展示）
//  子页：我的钱包/余额，我的账单，我的订阅，订阅历史

import {
  getSubscriptions,
  unsubscribeChannel,
  getUserWallets,
} from '../../services/api/owl'

import storageUtil from '../../utils/storageUtil'
import { copyText } from '../../utils/copyUtil'
import { logout } from '../../utils/loginUtil'

import styles from './index.module.scss'

function useMyWallets() {
  const { data, error } = useSWR('me?wallets', getUserWallets)
  if (error) {
    // wait to test logout error
    console.log(error)
    // logout(dispatch)
    // router.push('/')
    toast.error(error.message)
  }
  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function useMySubscriptions() {
  const { data, error } = useSWR('subscriptions?enabled', getSubscriptions)
  if (error) {
    // wait to test logout error
    console.log(error)
    // logout(dispatch)
    // router.push('/')
    toast.error(error.message)
  }
  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function toUnsubscribeChannel(event, t, channel_id, channel_index) {
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
      toast.error(error.message)
      event.target.disabled = false
    })
}

function User() {
  const { t } = useTranslation('common')
  const [, dispatch] = useContext(ProfileContext)
  const router = useRouter()

  const mySubscriptions = useMySubscriptions()
  const myWallets = useMyWallets()

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('my_balances')}</p>
      <div className={styles.walletsWrap}>
        {myWallets.isLoading && (
          <Loading size={14} className={styles.loading} />
        )}

        {myWallets.data && (
          <>
            <div className={styles.wallet}>
              <div>
                <span className={styles.nut_icon}>👛</span>
                <span className={styles.val}>{myWallets.data.wallets.NUT}</span>
                {'NUT'}
                {' + '}
                <span className={styles.val}>
                  {myWallets.data.wallets.gNUT}
                </span>
                {'gNUT'}
              </div>

              <div className={styles.tip}>
                <strong>{'NUT '}</strong>
                <span>{t('nut_tip')}</span> <strong>{'gNUT '}</strong>{' '}
                <span>{t('gnut_tip')}</span>{' '}
                <span>{t('nut_spending_tip')}</span>
              </div>
            </div>

            <div className={styles.wallet}>
              <div>
                <span className={styles.nut_icon}>🌰 {t('revenue')} </span>
                <span className={styles.val}>
                  {myWallets.data.wallets.revenue}
                </span>
                {'NUT '}
              </div>

              <div className={styles.tip}>
                <span>{t('revenue_tip')}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {mySubscriptions.isLoading && (
        <Loading size={40} className={styles.loading} />
      )}
      {mySubscriptions.data && (
        <>
          <p className={styles.sectionTitle}># {t('my_subscription')}</p>
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
                        {t('unfollow')}
                      </button>
                    </div>
                  </>
                </Collapse>
              )
            })}
        </>
      )}

      <OwlToast />
    </div>
  )
}

export default User
