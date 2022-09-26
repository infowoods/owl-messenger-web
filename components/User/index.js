import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Tooltip } from '@nextui-org/react'

import { ProfileContext } from '../../stores/useProfile'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const QrCodeSheet = dynamic(() => import('../Home/QrCodeSheet'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
const BottomSheet = dynamic(() => import('../../widgets/BottomSheet'))

import Icon from '../../widgets/Icon'
import Collapse from '../../widgets/Collapse'
import Loading from '../../widgets/Loading'

import {
  getSubscriptions,
  getSubscriptionHistory,
  unsubscribeChannel,
  subscribeChannel,
  checkOrder,
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
  return {
    data: null,
    isLoading: false,
    isError: true,
  }
  const { data, error } = useSWR('hot', getSubscriptions)
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

function User() {
  const { t } = useTranslation('common')
  const [, dispatch] = useContext(ProfileContext)
  const router = useRouter()
  const [btnSelect, setBtnSelect] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const [orderId, setOrderId] = useState('')
  const [check, setCheck] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [payUrl, setPayUrl] = useState('')

  const mySubscriptions = useMySubscriptions()
  const myWallets = useMyWallets()

  useEffect(() => {
    if (check) {
      const orderInterval = setInterval(async () => {
        const res = await checkOrder(orderId)
        if (res?.paid?.amount) {
          toast.success(t('subscribe_success'))
          setCheck(false)
          setOrderId('')
        }
      }, 3000)
      setIntervalId(orderInterval)
    } else {
      setOrderId('')
      intervalId && clearInterval(intervalId)
    }
  }, [check])

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('my_balance')}</p>
      <div className={styles.walletsWrap}>
        {myWallets.isLoading && (
          <Loading size={10} className={styles.loading} />
        )}
        {myWallets.data && (
          <>
            <div className={styles.wallet}>
              <span>
                <span className={styles.nut_icon}>🌰</span>
                <span className={styles.val}>
                  {myWallets.data.wallets.gNUT}
                </span>
                {'gNUT'}
                <sup>
                  <Tooltip content={t('gnut_tip')}>
                    <Icon type="help-fill" />
                  </Tooltip>
                </sup>
              </span>
            </div>

            <div className={styles.wallet}>
              <span>
                <span className={styles.nut_icon}>🌰</span>
                <span className={styles.val}>{myWallets.data.wallets.NUT}</span>
                {'NUT'}
              </span>
              <sup>
                <Tooltip content={t('nut_tip')}>
                  <Icon type="help-fill" />
                </Tooltip>
              </sup>
            </div>

            <div className={styles.wallet}>
              <span>
                <span className={styles.nut_icon}>🌰</span>
                <span className={styles.val}>
                  {myWallets.data.wallets.revenue}
                </span>
                {'NUT '} {t('revenue')}
              </span>
              <sup>
                <Tooltip content={t('revenue_tip')}>
                  <Icon type="help-fill" />
                </Tooltip>
              </sup>
            </div>
          </>
        )}
      </div>

      {mySubscriptions.isLoading ? (
        <Loading size={40} className={styles.loading} />
      ) : (
        <>
          <p className={styles.sectionTitle}># {t('following')}</p>
          {!mySubscriptions.data?.subscriptions && (
            <div className={styles.empty}>
              <Icon type="ufo" />
              <p>{t('no_records')}</p>
            </div>
          )}
          {mySubscriptions?.data?.subscriptions?.length > 0 &&
            mySubscriptions.data.subscriptions.map((feed, index) => {
              const params = {
                topic_id: feed.channel.id,
              }
              return (
                <Collapse title={feed.channel.title} key={feed.channel.id}>
                  <>
                    {feed.channel.description && (
                      <p className={styles.feedDesc}>
                        <span>
                          {t('desc')}
                          {t('colon')}
                        </span>
                        {feed.channel.description}
                      </p>
                    )}
                    <div className={styles.copy}>
                      <p>
                        <span>
                          {t('channel_uri')} {feed.channel.uri}
                          {t('colon')}
                        </span>
                        <span
                          onClick={() => copyText(feed.channel.uri, toast, t)}
                        >
                          {feed.channel.uri} <Icon type="copy" />
                        </span>
                      </p>
                    </div>

                    <div
                      className={`${styles.detail} ${styles.increaseMargin}`}
                    >
                      <button
                        className={styles.button}
                        onClick={() => {
                          toUnsubscribeChannel(feed.channel.id)
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

      <BottomSheet
        t={t}
        className={styles.confirmSheet}
        show={showConfirm}
        withConfirm
        confirmTitle={t('confirm_unfollow')}
        onConfirm={async () => {
          await unsubscribeChannel(unfoChannel)
          setShowConfirm(false)
          getUserFollows()
          getUserUnFollows()
        }}
        onClose={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
      />

      <Overlay
        t={t}
        desc={t('checking_pay')}
        visible={check}
        onCancel={() => setCheck(false)}
      />

      <QrCodeSheet
        t={t}
        show={payUrl}
        id={payUrl}
        onClose={() => {
          setPayUrl('')
        }}
        onCancel={() => {
          setPayUrl('')
        }}
        onConfirm={() => {
          setPayUrl('')
        }}
      />

      <OwlToast />
    </div>
  )
}

export default User
