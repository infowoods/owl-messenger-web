import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useEffect, useContext, useState } from 'react'
import { Input, useInput } from '@nextui-org/react'
import { RiInformationFill, RiLinksLine } from 'react-icons/ri'

import { parseSourceUri } from '../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../utils/apiUtils'
import { ignoreEvent } from '../../../utils/pageUtil'
import Loading from '../../../widgets/Loading'

const ChannelCard = dynamic(() => import('../../Discovery/ChannelCard'))

import styles from './index.module.scss'

function UriParsing(props) {
  const { ctx, t, curLogin } = props
  const router = useRouter()

  const inputURI = useInput('')
  const [uriError, setUriError] = useState(false)
  const [errorTip, setErrorTip] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [channel, setChannel] = useState(null)

  const toParseUri = () => {
    if (!curLogin.token) {
      toast(t('login_first'), { icon: '💁' })
      return
    }

    if (isParsing) return

    setErrorTip('')
    setChannel(null)
    const val = validateURI()
    if (!val) return

    setIsParsing(true)
    const params = { uri: val }
    parseSourceUri(params)
      .then((rsp) => {
        if (rsp?.id) {
          setChannel(rsp)
        }
      })
      .catch((err) => {
        handleInfowoodsApiError(err)
        setErrorTip(err?.message || t('parsing_error_uri'))
      })
      .finally(() => {
        setIsParsing(false)
      })
  }

  const validateURI = () => {
    const regularURI = inputURI.value.trim().toLowerCase()

    if (!regularURI) return

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

  const onChange = (e) => {
    inputURI.setValue(e.target.value)
    setErrorTip('')
    setUriError(false) //有延后，当点击清空按钮时

    if (inputURI.value.length > 7) {
      validateURI()
    }
  }

  const onKeyDown = (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed) {
      e.preventDefault()
      toParseUri()
    }
  }

  return (
    <div className={styles.wrap}>
      <form
        action="#"
        onBlur={ignoreEvent}
        onSubmit={(e) => {
          ignoreEvent(e)
          toParseUri()
        }}
      >
        <Input
          className={styles.input}
          aria-label="parsing_input"
          type="search"
          clearable
          bordered
          size="xl"
          placeholder={t('uri_here')}
          value={inputURI.value}
          fullWidth={true}
          contentLeft={<RiLinksLine />}
          onKeyDown={onKeyDown}
          onChange={onChange}
          onBlur={ignoreEvent}
        />
      </form>

      {/* 实时告知 URI 格式错误 */}
      {uriError && (
        <div className={styles.errorTip}>
          <RiInformationFill />
          <p>{t('invalid_uri')}</p>
        </div>
      )}

      {/* 解析错误 */}
      {errorTip !== '' && (
        <div className={styles.errorTip}>
          <RiInformationFill />
          <span>{errorTip}</span>
        </div>
      )}

      {isParsing && (
        <div className={styles.loadingWrap}>
          <Loading size="md" />
          <div className={styles.loadingHint}>{t('waiting_parsing')}</div>
        </div>
      )}
      {!isParsing && channel && (
        <ChannelCard curLogin={curLogin} t={t} channel={channel} />
      )}
    </div>
  )
}

export default UriParsing
