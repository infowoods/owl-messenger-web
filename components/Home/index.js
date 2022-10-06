import { useEffect, useContext, useState } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { RiSearchLine, RiInformationFill, RiQuestionFill } from 'react-icons/ri'

import { parseFeed, subscribeChannel, checkGroup } from '../../services/api/owl'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
import { CurrentLoginContext } from '../../contexts/currentLogin'

import { APP_NAME } from '../../constants'
import Tooltip from '../../widgets/Tooltip'
import Input from '../../widgets/Input'
import Loading from '../../widgets/Loading'
import UriSampleSheet from './UriSampleSheet'
import { logout, saveGroupData } from '../../utils/loginUtil'
import { getMixinContext } from '../../utils/pageUtil'

import styles from './index.module.scss'

function toSubscribeChannel(event, t, channel_id) {
  event.target.innerHTML = t('subscribing')

  event.target.disabled = true

  subscribeChannel(channel_id)
    .then(() => {
      toast.success(t('subscribe_success'))
      event.target.innerHTML = '✓' + t('subscribed')
    })
    .catch((error) => {
      toast.error(error.message)
      event.target.disabled = false
      event.target.innerHTML = t('subscribe')
    })
}

function Home() {
  const { t } = useTranslation('common')
  const router = useRouter()

  const [curLogin, loginDispatch] = useContext(CurrentLoginContext)
  const [source_uri, setSourceUri] = useState('')
  const [check, setCheck] = useState(false)
  const [parsingResult, setParsingResult] = useState({})
  const [parsingError, setParsingError] = useState('')
  const [uriError, setUriError] = useState(false)
  const [parsing, setParsing] = useState(false)
  const inputPrefix = <RiSearchLine className={styles.searchIcon} />

  useEffect(() => {
    const ctx = getMixinContext()

    if (ctx) {
      if (ctx.conversation_id) {
        checkGroup({
          app: APP_NAME,
          conversation_id: ctx.conversation_id,
        }).then((data) => {
          saveGroupData(ctx.conversation_id, data)
          curLogin.group = data
          // loginDispatch({
          //   type: 'group',
          //   group: data,
          // })
        })
      }
    }
  }, [])

  const handleInput = (val) => {
    setParsingError('')

    if (!val) {
      setSourceUri('')
      return
    }
    setSourceUri(val)
    validateSourceUri()
  }

  const handleClear = () => {
    setParsingResult({})
    setParsingError('')
  }

  const parseSourceURI = async (uri) => {
    const params = { uri: uri }
    try {
      const res = await parseFeed(params)
      if (res?.id) {
        setParsingResult(res)
        setParsing(false)
      }
    } catch (error) {
      if (error?.action === 'logout') {
        toast.error(t('auth_expire'))
        setParsing(false)
        logout(dispatch)
        return
      }
      setParsingError(error?.message || t('parsing_error_uri'))
      setParsing(false)
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
    setParsingError('')
    setParsingResult({})
    if (validateSourceUri()) {
      setParsing(true)
      parseSourceURI(source_uri)
    } else {
      setParsingError(t('invalid_uri'))
    }
  }

  const handleKeyDown = (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed && !curLogin.token) {
      toast(t('login_first'), { icon: '💁' })
      e.preventDefault()

      // authLogin()
      return
    }
    if (enterPressed && curLogin.token) {
      e.target.blur()
      handleParse(source_uri)
    }
  }

  return (
    <div className={styles.main}>
      {/* 信息源地址输入框 */}
      <form className={styles.search} action=".">
        <Input
          className={styles.input}
          type="search"
          prefix={inputPrefix}
          placeholder={t('uri_here')}
          value={source_uri}
          onChange={handleInput}
          onClear={handleClear}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </form>

      {/* 实时告知 URI 格式错误 */}
      {!parsingError && uriError && source_uri && source_uri.length > 7 && (
        <div className={styles.errorInfo}>
          <RiInformationFill />
          <p>{t('invalid_uri')}</p>
        </div>
      )}

      {/* 解析错误 */}
      {parsingError && (
        <div className={styles.errorInfo}>
          <RiInformationFill />
          <p>
            {parsingError.indexOf(' ') >= 0 ? parsingError : t(parsingError)}
          </p>
        </div>
      )}

      {/* 解析后源信息卡片 */}
      {parsing ? (
        <div className={styles.loadingWrap}>
          <Loading size={30} className={styles.loading} />
          <span className={styles.loadingHint}>{t('loading_hint')}</span>
        </div>
      ) : (
        parsingResult?.id && (
          <>
            <div className={styles.parsingResult}>
              <div className={styles.channelDesc}>
                <div>
                  <p>{parsingResult.title}</p>
                  {parsingResult.description && (
                    <p>
                      {t('desc')}
                      {t('colon')}
                      {parsingResult.description}
                    </p>
                  )}
                </div>

                {parsingResult?.subscription?.enabled ? (
                  <button disabled>{t('subscribed')}</button>
                ) : (
                  <button
                    onClick={(event) => {
                      toSubscribeChannel(event, t, parsingResult.id)
                    }}
                  >
                    {t('subscribe')}
                  </button>
                )}
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
                      {parsingResult.price_per_info.channel_fee}
                      {', '}
                      {t('pushing_info_price')}
                      {': '}
                      {parsingResult.price_per_info.pushing_fee.min}
                      {' ~ '}
                      {parsingResult.price_per_info.pushing_fee.max}
                    </span>
                  }
                >
                  <p>
                    {t('price_per_info')}
                    {': '}
                    {Math.round(
                      (parseFloat(parsingResult.price_per_info.channel_fee) +
                        parseFloat(
                          parsingResult.price_per_info.pushing_fee.min
                        )) *
                        1000
                    ) / 1000}
                    {' ~ '}
                    {Math.round(
                      (parseFloat(parsingResult.price_per_info.channel_fee) +
                        parseFloat(
                          parsingResult.price_per_info.pushing_fee.max
                        )) *
                        1000
                    ) / 1000}
                    {' NUT / '}
                    {t('each_info')}
                    <RiQuestionFill />
                  </p>
                </Tooltip>
              </div>

              <div className={styles.how_to_charge}>
                <p>{t('how_to_charge')}</p>
                <p>
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
                        <RiQuestionFill />
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
                        <RiQuestionFill />
                      </span>
                    </Tooltip>
                  </span>
                </p>
              </div>
            </div>
          </>
        )
      )}

      {/* 未解析地址时 */}
      {!parsingResult?.id && !parsing && (
        <>
          {/* intro to discovery */}
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

          <UriSampleSheet toast={toast} t={t} />
        </>
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
