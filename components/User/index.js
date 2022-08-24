import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { ProfileContext } from '../../stores/useProfile'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const QrCodeSheet = dynamic(() => import('../Home/QrCodeSheet'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
const BottomSheet = dynamic(() => import('../../widgets/BottomSheet'))

import Icon from '../../widgets/Icon'
import Collapse from '../../widgets/Collapse'
import Loading from '../../widgets/Loading'

import {
  getFollows,
  getUnFollows,
  unfollowFeeds,
  refollowFeeds,
  checkOrder,
  getUserBalance,
} from '../../services/api/owl'

import storageUtil from '../../utils/storageUtil'
import { copyText } from '../../utils/copyUtil'
import { logout } from '../../utils/loginUtil'

import styles from './index.module.scss'

function User() {
  const { t } = useTranslation('common')
  const [, dispatch] = useContext(ProfileContext)
  const router = useRouter()
  const [empty, setEmpty] = useState(false)
  const [btnSelect, setBtnSelect] = useState('')
  const [feedList, setFeedList] = useState([])
  const [unFollowList, setUnFollowList] = useState([])
  const [balance, setBalance] = useState({})
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [unfoChannel, setUnfoChannel] = useState('')

  const [orderId, setOrderId] = useState('')
  const [check, setCheck] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [payUrl, setPayUrl] = useState('')

  const getUserFollows = async () => {
    try {
      const followsList = await getFollows()
      if (followsList?.number?.toString()) {
        if (followsList?.number === 0) {
          setEmpty(true)
        } else {
          setFeedList(followsList.subscriptions)
        }
        setLoading(false)
      } else {
        toast.error('Error')
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      if (error?.action === 'logout') {
        logout(dispatch)
        router.push('/')
        return
      }
      toast.error('Failed')
    } finally {
      setLoading(false)
    }
  }

  const getUserUnFollows = async () => {
    try {
      const followsList = await getUnFollows()
      if (followsList?.number?.toString()) {
        if (followsList?.number === 0) {
          setEmpty(true)
        } else {
          setUnFollowList(followsList.subscriptions)
        }
        setLoading(false)
      } else {
        toast.error('Error')
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      if (error?.action === 'logout') {
        logout(dispatch)
        router.push('/')
        return
      }
      toast.error('Failed')
    } finally {
      setLoading(false)
    }
  }

  const sourceType = (uri) => {
    if (uri.slice(0, 4) === 'http') {
        return 'RSS/Atom'
    }
    return 'Channel'
  }

  const getBalance = async () => {
    const data = await getUserBalance()
    setBalance(data)
  }

  useEffect(() => {
    if (check) {
      const orderInterval = setInterval(async () => {
        const res = await checkOrder(orderId)
        if (res?.paid?.amount) {
          toast.success(t('subcribe_success'))
          setCheck(false)
          setOrderId('')
          getUserFollows()
        }
      }, 3000)
      setIntervalId(orderInterval)
    } else {
      setOrderId('')
      intervalId && clearInterval(intervalId)
    }
  }, [check])

  useEffect(() => {
    getUserFollows()
    getUserUnFollows()
    getBalance()
  }, [])

  return (
    <div className={styles.main}>
      {empty && (
        <div className={styles.empty}>
          <Icon type="ufo" />
          <p>{t('no_records')}</p>
        </div>
      )}

      {loading ? (
        <Loading size={40} className={styles.loading} />
      ) : (
        <>
          <div>
            <p className={styles.sectionTitle}># {t('my_balance')}</p>
            <div className={styles.balanceWrap}>
              <div className={styles.balance}>
                <p>gINFO: <span>{balance?.wallets?.hazelnut}</span></p>
                <p>INFO: <span>{balance?.wallets?.acorn}</span></p>
              </div>
              <p className={styles.infoRemark}>{t('info_remark')}</p>
            </div>
          </div>

          {feedList?.length > 0 && (
            <p className={styles.sectionTitle}># {t('following')}</p>
          )}
          {feedList?.length > 0 &&
            feedList.map((feed, index) => {
              const params = {
                topic_id: feed.channel.id,
              }
              return (
                <Collapse
                  title={feed.channel.title}
                  key={feed.channel.id}
                >
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
                          {t('source_uri')} {sourceType(feed.channel.uri)}
                          {t('colon')}
                        </span>
                        <span onClick={() => copyText(feed.channel.uri, toast, t)}>
                          {feed.channel.uri} <Icon type="copy" />
                        </span>
                      </p>
                    </div>

                    <div
                      className={`${styles.detail} ${
                        feed.channel.description && styles.increaseMargin
                      }`}
                    >
                      <button
                        className={styles.button}
                        onClick={() => {
                          setShowConfirm(true)
                          setUnfoChannel(feed.channel.id)
                        }}
                      >
                        {t('unfollow')}
                      </button>
                    </div>
                  </>
                </Collapse>
              )
            })}

          {unFollowList.length > 0 && (
            <p className={styles.sectionTitle}># {t('history')}</p>
          )}
          {unFollowList.length > 0 &&
            unFollowList.map((feed, index) => {
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
                    <div
                      className={`${styles.detail} ${
                        feed.channel.description && styles.increaseMargin
                      }`}
                    >
                      <button
                        className={`${styles.button} ${styles.buttonAccent}`}
                        onClick={async () => {
                          setBtnSelect(index + 'refollow')
                          await refollowFeeds(feed.channel.id)
                          getUserFollows()
                          getUserUnFollows()
                        }}
                      >
                        {btnSelect === index + 'refollow' ? (
                          <Loading size={18} className={styles.btnLoading} />
                        ) : (
                          t('refollow')
                        )}
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
          await unfollowFeeds(unfoChannel)
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
