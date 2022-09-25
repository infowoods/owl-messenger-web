import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { ProfileContext } from '../../stores/useProfile'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const PriceSheet = dynamic(() => import('../Home/PriceSheet'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
const QrCodeSheet = dynamic(() => import('../Home/QrCodeSheet'))

import { subscribeOptions } from '../Home/config'

import Icon from '../../widgets/Icon'
import Loading from '../../widgets/Loading'

import { copyText } from '../../utils/copyUtil'
import { formatAdd } from '../../utils/numberUtil'
import { authLogin, logout } from '../../utils/loginUtil'
import storageUtil from '../../utils/storageUtil'

import { getHotTopics } from '../../services/api/owl'
import { subscribeChannel, checkOrder } from '../../services/api/owl'

import styles from './index.module.scss'

function HotChannels() {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const isLogin = state.userInfo && state.userInfo.user_name
  const [list, setList] = useState([])
  const [showSubscribe, setShowSubscribe] = useState(false)
  const [monthlyPrice, setMonthlyPrice] = useState(0)
  const [yearlyPrice, setYearlyPrice] = useState(0)
  const [chargeCrypto, setChargeCrypto] = useState({})
  const [selectPeriod, setSelectPeriod] = useState('')
  const [feedInfo, setFeedInfo] = useState({})
  const [payUrl, setPayUrl] = useState('')
  const [orderId, setOrderId] = useState('')
  const [check, setCheck] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [followedIdx, setFollowedIdx] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const invokeFunc = async () => {
      const res = await getHotTopics()
      setLoading(false)
      res && res?.length > 0 && setList(res)
    }
    invokeFunc()
  }, [])

  useEffect(() => {
    if (check) {
      const orderInterval = setInterval(async () => {
        const res = await checkOrder(orderId)
        if (res?.paid?.amount) {
          toast.success(t('subcribe_success'))
          setCheck(false)
          setOrderId('')
          setSelectPeriod('')
          setFollowedIdx(feedInfo.tid)
        }
      }, 3000)
      setIntervalId(orderInterval)
    } else {
      setOrderId('')
      intervalId && clearInterval(intervalId)
    }
  }, [check])

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

  const setPriceInfo = (res) => {
    if (!isLogin) {
      authLogin()
      return
    }

    setFeedInfo(res)
    const monPrice = formatAdd(res.price.monthly, res.service_charge.monthly)
    const yearPrice = formatAdd(res.price.yearly, res.service_charge.yearly)
    setMonthlyPrice(monPrice)
    setYearlyPrice(yearPrice)
    setChargeCrypto(res.service_charge.currency)
    setShowSubscribe(true)
  }

  const handleSubscribe = async (period) => {
    const params = {
      action: 'follow',
      tid: feedInfo.tid,
      period: period,
    }
    try {
      const res = (await subscribeChannel(feedInfo.tid)) || {}

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
      if (error?.action === 'logout') {
        toast.error(t('auth_expire'))
        logout(dispatch)
        return
      }
      toast.error(error?.data.message || 'Failed')
    }
  }

  return (
    <div className={styles.main}>
      <p className={styles.title}># {t('hot_now')}</p>
      {loading ? (
        <Loading size={40} className={styles.loading} />
      ) : (
        list &&
        list.map((item, index) => (
          <div className={styles.card} key={index}>
            <p>{item.title}</p>
            <p>
              <span>
                {t('desc')}
                {t('colon')}
              </span>
              {item.desc}
            </p>
            <div className={styles.copy}>
              <p>
                <span>
                  {t('source_uri')} ({sourceType(item.source_type)}){t('colon')}
                </span>
                <span onClick={() => copyText(item.uri, toast, t)}>
                  {item.uri} <Icon type="copy" />
                </span>
              </p>
            </div>
            <button
              className={styles.button}
              onClick={() => setPriceInfo(item)}
            >
              {item.tid === followedIdx ? t('following') : t('follow')}
            </button>
          </div>
        ))
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

export default HotChannels
