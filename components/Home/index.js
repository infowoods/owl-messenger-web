import { useEffect, useContext, useState } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { ProfileContext } from '../../stores/useProfile'

import toast from 'react-hot-toast'
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
const FeedTypeSheet = dynamic(() => import('./FeedTypeSheet'))

import Icon from '../../widgets/Icon'
import Tooltip from '../../widgets/Tooltip'
import Input from '../../widgets/Input'
import Loading from '../../widgets/Loading'

import { feedOptions } from './config'

import { authLogin, logout } from '../../utils/loginUtil'

import { parseFeed, subscribeTopic, checkOrder } from '../../services/api/owl'

import styles from './index.module.scss'

function Home() {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const { push } = useRouter()
  const isLogin = state.userInfo && state.userInfo.user_name
  // console.log('homepage state:', state)

  const [feed, setFeed] = useState('')
  const [show, setShow] = useState(false)
  const [check, setCheck] = useState(false)
  const defaultType = {
    type: 'oak',
    icon: 'oak-leaf',
    name: t('oak'),
    placeholder: t('oak_ph'),
  }
  const [feedType, setFeedType] = useState(defaultType)
  const [feedInfo, setFeedInfo] = useState({})
  const [feedError, setFeedError] = useState('')

  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [intervalId, setIntervalId] = useState(null)
  const [followBtnText, setFollowBtnText] = useState(t('follow'))
  const [followLoading, setFollowLoading] = useState(false)

  const prefix = <Icon type="search" className={styles.searchIcon} />

  const handleSearch = (val) => {
    if (!val) {
      setFeedInfo({})
      setFeedError('')
      setFollowBtnText(t('follow'))
    }
    setFeed(val)
  }

  const handleClear = () => {
    setFeedInfo({})
    setFeedError('')
    setFollowBtnText(t('follow'))
  }

  const parseExternalFeed = async (feed) => {
    let parseUrl
    switch (feedType.type) {
      case 'rss':
        parseUrl = feed
        break
      case 'oak':
        parseUrl = feed
        break
      case 'weibo':
        parseUrl = 'https://weibo.com/' + feed
        break
      case 'twitter':
        parseUrl = 'https://twitter.com/' + feed
        break
      default:
        break
    }
    const params = {uri: parseUrl}
    try {
      const res = await parseFeed(params)
      if (res?.id) {
        setFeedInfo(res)
        setLoading(false)
        if (res.subscription?.enabled) setFollowBtnText(t('already_follow'))
      }
    } catch (error) {
      if (error?.action === 'logout') {
        toast.error(t('auth_expire'))
        setLoading(false)
        logout(dispatch)
        return
      }
      setFeedError(error?.data?.message || `${feedType.type}_parse_error`)
      setLoading(false)
    }
  }

  const inputValidate = (feed) => {
    const trimFeed = feed.trim()
    switch (feedType.type) {
      case 'rss':
        return (
          trimFeed.slice(0, 8) === 'https://' ||
          trimFeed.slice(0, 7) === 'http://'
        )
      case 'oak':
        return trimFeed.slice(0, 4) === 'och:'
      case 'weibo':
        const wReg = new RegExp(/^[A-Za-z0-9_]{3,20}$/)
        return wReg.test(trimFeed)
      case 'twitter':
        const tReg = new RegExp(/^[A-Za-z0-9_]{4,15}$/)
        return tReg.test(trimFeed)
      default:
        return
    }
  }

  const handleParse = async (feed) => {
    setFeedInfo({})
    setFeedError('')
    setFollowBtnText(t('follow'))
    if (inputValidate(feed)) {
      setLoading(true)
      parseExternalFeed(feed)
    } else {
      setFeedError(`${feedType.type}_validate_error`)
    }
  }

  const handleKeyDown = (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed && !isLogin) {
      authLogin()
      return
    }
    if (enterPressed && isLogin) {
      handleParse(feed)
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
          setFollowBtnText(t('following'))
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
      {/* 搜索类型选择 */}
      <div className={styles.options}>
        <span>
          {t('current_type')}
          {t('colon')}
        </span>
        <div
          className={`${show && styles.optionsActive}`}
          onClick={() => setShow(true)}
        >
          <Icon type={feedType.icon} className={styles.curIcon} />
          <span>{feedType.name}</span>
          <Icon
            type="triangle-flat"
            className={`${styles.triangle} ${show && styles.triangleActive}`}
          />
        </div>
      </div>

      {/* 搜索框 */}
      <form className={styles.search} action=".">
        <Input
          className={styles.input}
          type="search"
          prefix={prefix}
          placeholder={feedType.placeholder}
          value={feed}
          onChange={handleSearch}
          onClear={handleClear}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </form>

      {
        !feedInfo?.id && !loading &&
        <p className={styles.hot} onClick={() => {
          if (isLogin) push('/discovery')
          else {
            toast('Login first', { icon: '💁' })
            return
          }
        }}>
          <a>{t('hot_now')} &#8594;</a>
        </p>
      }

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
                <button onClick={async() => {
                  if (followBtnText === t('already_follow')) return
                  setFollowLoading(true)
                  try {
                    const res = await subscribeTopic({ channel_id: feedInfo.id })
                    if (res?.enabled) {
                      setFollowBtnText(t('already_follow'))
                    }
                  } catch (error) {
                    toast.error('Error')
                  }
                  setFollowLoading(false)
                }}>
                  {
                    followLoading ? <Loading className={styles.followLoading} size={19} /> : followBtnText
                  }
                </button>
              </div>
            </div>
            <div className={styles.feedPrice}>
              <p>
                {t('subcribe_price')}
                <span>
                  {t('price_desc')}
                  {t('colon')}
                </span>
              </p>
              <div>
                <Tooltip
                    position="center"
                    theme="dark"
                    content={
                      <span className={styles.help}>
                        {t('channel_fee_desc')}
                      </span>
                    }
                  >
                  <p>
                    {t('channel_fee')} {feedInfo.price_per_info.channel_fee} NUT
                    <Icon type="help-fill" />
                  </p>
                </Tooltip>
              </div>
              <div>
                <span>{t('push_fee')}</span>
                <Tooltip
                  position="center"
                  theme="dark"
                  content={
                    <span className={styles.help}>
                      {t('min_max_desc')}
                    </span>
                  }
                >
                  <p>
                    {t('min')}{feedInfo.price_per_info.pushing_fee.min} NUT / {t('each_message')}
                  </p>
                  <div className={styles.divider}></div>
                  <p>
                    {t('max')}{feedInfo.price_per_info.pushing_fee.max} NUT / {t('each_message')}
                    <Icon type="help-fill" />
                  </p>
                </Tooltip>
              </div>
            </div>
          </>
        )
      )}

      {/* 解析错误 */}
      {feedError && (
        <div className={styles.errorInfo}>
          <Icon type="info-fill" />
          <p>{feedError.indexOf(' ') >= 0 ? feedError : t(feedError)}</p>
        </div>
      )}

      {/* 搜索源选项 */}
      <FeedTypeSheet
        t={t}
        show={show}
        onClose={() => setShow(false)}
        feedOptions={feedOptions(t)}
        feedType={feedType}
        setFeedType={setFeedType}
        setFeedInfo={setFeedInfo}
        setFeedError={setFeedError}
        setShow={setShow}
      />

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
