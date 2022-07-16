import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { ProfileContext } from '../../stores/useProfile'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const PriceSheet = dynamic(() => import('../Home/PriceSheet'))
const QrCodeSheet = dynamic(() => import('../Home/QrCodeSheet'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))

import { subscribeOptions } from '../Home/config'

import Icon from '../../widgets/Icon'
import Collapse from '../../widgets/Collapse'
import Loading from '../../widgets/Loading'

import {
  getFollows,
  unfollowFeeds,
  parseTopic,
  subscribeTopic,
  checkOrder,
} from '../../services/api/owl'

import storageUtil from '../../utils/storageUtil'
import { convertTimestamp, timeDifference } from '../../utils/timeUtil'
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
  const [loading, setLoading] = useState(true)
  const [showSubscribe, setShowSubscribe] = useState(false)
  const [chargeCrypto, setChargeCrypto] = useState({})
  const [selectPeriod, setSelectPeriod] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState(0)
  const [yearlyPrice, setYearlyPrice] = useState(0)
  const [refollowId, setRefollowId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [check, setCheck] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [payUrl, setPayUrl] = useState('')
  const [offset, setOffset] = useState(null)

  const renderReason = (val) => {
    if (val === 'cancel') {
      return t('manual_cancel')
    } else if (val === 'expired') {
      return t('feed_expired')
    }
  }

  const handleUnfollow = async (params) => {
    try {
      const res = await unfollowFeeds(params)
      if (res.topic_id) {
        toast.success(t('unfollow_success'))
        setBtnSelect('')
        getUserFollows()
      }
    } catch (error) {
      if (error?.action === 'logout') {
        logout(dispatch)
        router.push('/')
      }
    }
  }

  const getUserFollows = async () => {
    try {
      const followsList = await getFollows()
      if (followsList.utc_offset?.toString()) {
        setOffset(followsList.utc_offset)
        if (
          !followsList.follows?.ing?.length &&
          !followsList.follows?.history?.length
        ) {
          setEmpty(true)
        } else {
          setFeedList(followsList.follows)
        }
        setLoading(false)
      } else {
        toast.error('Error')
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      if (error?.data?.message === 'no user data') {
        setEmpty(true)
        return
      }
      if (error?.data?.err_code === 'OWL-D100') {
        setEmpty(true)
        return
      }
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

  const handleRefollow = async (tid) => {
    const params = {
      action: 'query',
      tid: tid,
    }
    try {
      const res = (await parseTopic(params)) || {}
      if (res?.price) {
        const monPrice = (
          Number(res.price.monthly) + Number(res.service_charge.monthly)
        )
          .toFixed(8)
          .replace(/\.?0+$/, '')
        const yearPrice = (
          Number(res.price.yearly) + Number(res.service_charge.yearly)
        )
          .toFixed(8)
          .replace(/\.?0+$/, '')
        setMonthlyPrice(monPrice)
        setYearlyPrice(yearPrice)
        setChargeCrypto(res.service_charge.currency)
        setBtnSelect('')
        setShowSubscribe(true)
      }
    } catch (error) {
      toast.error('Failed')
    }
  }

  const handleSubscribe = async (period) => {
    const params = {
      action: 'follow',
      tid: refollowId,
      period: period,
    }
    try {
      const res = (await subscribeTopic(params)) || {}
      if (res?.payment_uri) {
        if (storageUtil.get('platform') === 'browser') {
          setPayUrl(res.payment_uri)
        } else {
          window.open(res.payment_uri)
        }
        setShowSubscribe(false)
        res?.order_id && setOrderId(res.order_id)
        setCheck(true)
      }
    } catch (error) {
      toast.error(error?.data.message || 'Failed')
    }
  }

  const sourceType = (type) => {
    switch (type.split(':')[0]) {
      case 'RSS':
        return 'RSS'
      case 'ATOM':
        return 'Atom'
      case 'OTH':
        return 'Oak Hub'
      default:
        break
    }
  }

  useEffect(() => {
    if (check) {
      const orderInterval = setInterval(async () => {
        const res = await checkOrder(orderId)
        if (res?.paid?.amount) {
          toast.success(t('subcribe_success'))
          setCheck(false)
          setOrderId('')
          setSelectPeriod('')
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
          {feedList?.ing && feedList?.ing.length > 0 && (
            <p className={styles.sectionTitle}># {t('following')}</p>
          )}
          {feedList?.ing &&
            feedList.ing.map((feed, index) => {
              const params = {
                topic_id: feed.tid,
              }
              const willExipre = timeDifference(feed.expire_ts, Date.now()) < 7
              return (
                <Collapse
                  title={feed.title}
                  key={feed.tid + index}
                  className={willExipre && styles.feedCollapse}
                >
                  <>
                    {feed.desc && (
                      <p className={styles.feedDesc}>
                        <span>
                          {t('desc')}
                          {t('colon')}
                        </span>
                        {feed.desc}
                      </p>
                    )}
                    <div
                      className={`${styles.detail} ${
                        feed.desc && styles.increaseMargin
                      }`}
                    >
                      <div>
                        <p>
                          <span>
                            {t('push_date')}
                            {t('colon')}
                          </span>
                          {convertTimestamp(feed.pushed_ts, offset)}
                        </p>
                        <p>
                          <span>
                            {t('update_date')}
                            {t('colon')}
                          </span>
                          {convertTimestamp(feed.updated_ts, offset)}
                        </p>
                        <p>
                          <span>
                            {t('crawl_date')}
                            {t('colon')}
                          </span>
                          {convertTimestamp(feed.fetched_ts, offset)}
                        </p>
                        {willExipre ? (
                          <p className={styles.renew}>
                            <span>
                              {t('will_expire')}
                              {t('colon')}
                            </span>
                            {convertTimestamp(feed.expire_ts, offset)}
                          </p>
                        ) : (
                          <p>
                            <span>
                              {t('expire_date')}
                              {t('colon')}
                            </span>
                            {convertTimestamp(feed.expire_ts, offset)}
                          </p>
                        )}
                      </div>
                      {willExipre ? (
                        <button
                          className={`${styles.button} ${styles.buttonAccent}`}
                          onClick={() => {
                            setBtnSelect(index + 'renew')
                            handleRefollow(feed.tid)
                            setRefollowId(feed.tid)
                          }}
                        >
                          {btnSelect === index + 'renew' ? (
                            <Loading size={18} className={styles.btnLoading} />
                          ) : (
                            t('renew')
                          )}
                        </button>
                      ) : (
                        <button
                          className={styles.button}
                          onClick={() => {
                            setBtnSelect(index + 'unfollow')
                            handleUnfollow(params)
                          }}
                        >
                          {btnSelect === index + 'unfollow' ? (
                            <Loading size={18} className={styles.btnLoading} />
                          ) : (
                            t('unfollow')
                          )}
                        </button>
                      )}
                    </div>
                    <div className={styles.copy}>
                      <p>
                        <span>
                          {t('source_uri')} ({sourceType(feed.source_type)})
                          {t('colon')}
                        </span>
                        <span onClick={() => copyText(feed.uri, toast, t)}>
                          {feed.uri} <Icon type="copy" />
                        </span>
                      </p>
                    </div>
                  </>
                </Collapse>
              )
            })}

          {feedList?.history && feedList?.history.length > 0 && (
            <p className={styles.sectionTitle}># {t('history')}</p>
          )}
          {feedList?.history &&
            feedList?.history.map((feed, index) => {
              return (
                <Collapse title={feed.title} key={feed.tid + index}>
                  <>
                    {feed.desc && (
                      <p className={styles.feedDesc}>
                        <span>
                          {t('desc')}
                          {t('colon')}
                        </span>
                        {feed.desc}
                      </p>
                    )}
                    <div
                      className={`${styles.detail} ${
                        feed.desc && styles.increaseMargin
                      }`}
                    >
                      <p>
                        <span>
                          {t('unfollow_reason')}
                          {t('colon')}
                        </span>
                        {renderReason(feed.reason)}
                      </p>
                      <button
                        className={`${styles.button} ${styles.buttonAccent}`}
                        onClick={() => {
                          setBtnSelect(index + 'refollow')
                          handleRefollow(feed.tid)
                          setRefollowId(feed.tid)
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

      <PriceSheet
        t={t}
        show={showSubscribe}
        withConfirm={true}
        confirmTitle={t('select_plan')}
        confirmText={t('pay')}
        onClose={() => {
          setSelectPeriod('')
          setShowSubscribe(false)
        }}
        onCancel={() => {
          setSelectPeriod('')
          setShowSubscribe(false)
        }}
        onConfirm={() => handleSubscribe(selectPeriod)}
        options={subscribeOptions(monthlyPrice, yearlyPrice)}
        selectPeriod={selectPeriod}
        chargeCrypto={chargeCrypto}
        setSelectPeriod={setSelectPeriod}
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
