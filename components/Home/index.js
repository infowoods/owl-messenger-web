import { useEffect, useContext, useState } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { ProfileContext } from '../../stores/useProfile'

import toast from 'react-hot-toast'
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
const UriSampleSheet = dynamic(() => import('./UriSampleSheet'))

import Icon from '../../widgets/Icon'
import Tooltip from '../../widgets/Tooltip'
import Input from '../../widgets/Input'
import Loading from '../../widgets/Loading'

import { authLogin, logout } from '../../utils/loginUtil'

import { parseFeed, subscribeChannel, checkOrder } from '../../services/api/owl'

import styles from './index.module.scss'

function Home() {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const { push } = useRouter()
  const isLogin = state.userInfo && state.userInfo.user_name
  // console.log('homepage state:', state)

  const [source_uri, setSourceUri] = useState('')
  const [show, setShow] = useState(false)
  const [check, setCheck] = useState(false)

  const [feedInfo, setFeedInfo] = useState({})
  const [feedError, setFeedError] = useState('')
  const [uriError, setUriError] = useState(false)

  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [intervalId, setIntervalId] = useState(null)
  const [subscribeBtnText, setSubscribeBtnText] = useState(t('subscribe'))
  const [followLoading, setFollowLoading] = useState(false)

  const prefix = <Icon type="search" className={styles.searchIcon} />

  const handleInput = (val) => {
    if (!val) {
      setSourceUri('')
      setFeedInfo({})
      setFeedError('')
      setSubscribeBtnText(t('subscribe'))
    }
    setSourceUri(val)
    validateSourceUri()
  }

  const handleClear = () => {
    setFeedInfo({})
    setFeedError('')
    setSubscribeBtnText(t('subscribe'))
  }

  const parseSourceURI = async (uri) => {
    const params = { uri: uri }
    try {
      const res = await parseFeed(params)
      if (res?.id) {
        console.log(res)
        setFeedInfo(res)
        setLoading(false)
        if (res.subscription?.enabled) setSubscribeBtnText(t('already_follow'))
      }
    } catch (error) {
      if (error?.action === 'logout') {
        toast.error(t('auth_expire'))
        setLoading(false)
        logout(dispatch)
        return
      }
      console.log(error)
      setFeedError(error?.message || t('parsing_error_uri'))
      setLoading(false)
    }
  }

  const validateSourceUri = () => {
    const regularURI = source_uri.trim().toLowerCase()
    if (
      regularURI.startsWith('och://') ||
      regularURI.startsWith('http://') ||
      regularURI.startsWith('https://')
    ) {
      setUriError(false)
      return regularURI
    } else {
      setUriError(true)
      return
    }
  }

  const handleParse = async () => {
    setFeedInfo({})
    setFeedError('')
    setSubscribeBtnText(t('subscribe'))
    if (validateSourceUri()) {
      setLoading(true)
      parseSourceURI(source_uri)
    } else {
      setFeedError(t('validation_error_uri'))
    }
  }

  const handleKeyDown = (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed && !isLogin) {
      if (isLogin) push('/discovery')
      else {
        toast(t('login_first'), { icon: '💁' })
        e.preventDefault()
        return
      }
      // authLogin()
      return
    }
    if (enterPressed && isLogin) {
      handleParse(source_uri)
      e.target.blur()
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
          setSubscribeBtnText(t('following'))
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
      {/* 信息源地址输入框 */}
      <form className={styles.search} action=".">
        <Input
          className={styles.input}
          type="search"
          prefix={prefix}
          placeholder={t('uri_here')}
          value={source_uri}
          onChange={handleInput}
          onClear={handleClear}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </form>

      {/* 实时告知 URI 格式错误 */}
      {!feedError && uriError && source_uri && source_uri.length > 7 && (
        <div className={styles.errorInfo}>
          <Icon type="info-fill" />
          <p>✘ {t('Invalid URI')}</p>
        </div>
      )}

      {/* 解析错误 */}
      {feedError && (
        <div className={styles.errorInfo}>
          <Icon type="info-fill" />
          <p>{feedError.indexOf(' ') >= 0 ? feedError : t(feedError)}</p>
        </div>
      )}

      {/* 信息源地址案例（无解析结果时） */}
      {!feedInfo?.id && !loading && (
        <>
          <UriSampleSheet t={t} />

          <p
            className={styles.hot}
            onClick={() => {
              if (isLogin) push('/discovery')
              else {
                toast(t('login_first'), { icon: '💁' })
                return
              }
            }}
          >
            <a>{t('hot_now')} &#8594;</a>
          </p>
        </>
      )}

      {/* 解析后源信息卡片 */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <Loading size={30} className={styles.loading} />
          <span className={styles.loadingHint}>{t('loading_hint')}</span>
        </div>
      ) : (
        feedInfo?.id && (
          <>
            <div className={styles.feedInfo}>
              <div className={styles.feedDesc}>
                <div>
                  <p>{feedInfo.title}</p>
                  {feedInfo.description && (
                    <p>
                      {t('desc')}
                      {t('colon')}
                      {feedInfo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (subscribeBtnText === t('already_follow')) return
                    setFollowLoading(true)
                    try {
                      const res = await subscribeChannel(feedInfo.id)
                      console.log(res)
                      if (res?.enabled) {
                        setSubscribeBtnText(t('already_follow'))
                      }
                    } catch (error) {
                      console.log(error)
                      toast.error('Error')
                    }
                    setFollowLoading(false)
                  }}
                >
                  {followLoading ? (
                    <Loading className={styles.followLoading} size={19} />
                  ) : (
                    subscribeBtnText
                  )}
                </button>
              </div>
            </div>
            <div className={styles.feedPrice}>
              <div className={styles.price}>
                <Tooltip
                  position="center"
                  theme="dark"
                  content={
                    <span className={styles.help}>
                      {t('channel_info_price')}
                      {': '}
                      {feedInfo.price_per_info.channel_fee}
                      {', '}
                      {t('pushing_info_price')}
                      {': '}
                      {feedInfo.price_per_info.pushing_fee.min}
                      {' ~ '}
                      {feedInfo.price_per_info.pushing_fee.max}
                    </span>
                  }
                >
                  <p>
                    {t('price_per_info')}
                    {': '}
                    {parseFloat(feedInfo.price_per_info.channel_fee) +
                      parseFloat(feedInfo.price_per_info.pushing_fee.min)}
                    {' ~ '}
                    {parseFloat(feedInfo.price_per_info.channel_fee) +
                      parseFloat(feedInfo.price_per_info.pushing_fee.max)}
                    {' NUT / '}
                    {t('per_info')}
                    <Icon type="help-fill" />
                  </p>
                </Tooltip>
              </div>

              <div className={styles.how_to_charge}>
                <p>{t('how_to_charge')}</p>
                <span>
                  {t('price_per_info')} {' = '}
                  <span>
                    <Tooltip
                      position="center"
                      theme="dark"
                      content={
                        <span className={styles.help}>
                          {t('channel_fee_desc')}
                        </span>
                      }
                    >
                      <span>
                        {t('channel_info_price')}
                        <Icon type="help-fill" />
                      </span>
                    </Tooltip>
                  </span>
                  {' + '}
                  <span>
                    <Tooltip
                      position="center"
                      theme="dark"
                      content={
                        <span className={styles.help}>
                          {t('pushing_fee_desc')}
                        </span>
                      }
                    >
                      <span>
                        {t('pushing_info_price')}
                        <Icon type="help-fill" />
                      </span>
                    </Tooltip>
                  </span>
                </span>
              </div>
            </div>
          </>
        )
      )}

      <Overlay
        t={t}
        desc={t('checking_pay')}
        visible={check}
        onCancel={() => setCheck(false)}
      />

      <OwlToast />
    </div>
  )
}

export default Home
