import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))

import Input from '../../widgets/Input'
import Icon from '../../widgets/Icon'
import Loading from '../../widgets/Loading'

import { searchSource, getHotCollections, subscribeTopic } from '../../services/api/owl'

import { copyText } from '../../utils/copyUtil'

import styles from './index.module.scss'

const Card = ({ t, item }) => {
  const [followBtnText, setFollowBtnText] = useState(t('follow'))
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (item.subscription?.enabled) setFollowBtnText(t('already_follow'))
  }, [item])

  return (
    <div key={item.id} className={styles.card}>
      <p className={styles.channelTitle}>{item.title}</p>
      <div className={styles.channelFee}>
        <p>
          {t('channel_fee')}
          {item.price_per_info.channel_fee} NUT
        </p>
        <div>
          <span>{t('push_fee')}{t('colon')}</span>
          <p>
            {t('min')}
            {item.price_per_info.pushing_fee.min} NUT
          </p>
          <p>
            {t('max')}
            {item.price_per_info.pushing_fee.max} NUT
          </p>
        </div>
      </div>
      <p className={styles.channelDesc}>
        <span>
          {t('desc')}{t('colon')}
        </span>
        {item.description}
      </p>
      <p className={styles.copy}>
        <span>
          {t('source_uri')}{t('colon')}
        </span>
        <span onClick={() => copyText(item.uri, toast, t)}>
          {item.uri} <Icon type="copy" />
        </span>
      </p>
      <button
        className={styles.button}
        onClick={async () => {
          if (followBtnText === t('already_follow')) return
          setFollowLoading(true)
          try {
            const res = await subscribeTopic({ channel_id: item.id })
            if (res?.enabled) {
              setFollowBtnText(t('already_follow'))
            }
          } catch (error) {
            toast.error('Error')
          }
          setFollowLoading(false)
        }}
      >
        {
          followLoading ? <Loading className={styles.followLoading} size={16} /> : followBtnText
        }
      </button>
    </div>
  )
}

function Discovery() {
  const { t } = useTranslation('common')
  const [searchType, setSearchType] = useState('channel')
  const [searchVal, setSearchVal] = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [hotList, setHotList] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [empty, setEmpty] = useState(false)
  const typeList = ['channel', 'weibo', 'twitter']

  const placeholder = (type) => {
    switch (type) {
      case 'channel':
        return t('channel_search_ph')
      case 'weibo':
        return t('weibo_search_ph')
      default:
        break
    }
  }

  const handleKeyDown = (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed) {
      handleSearch()
      e.target.blur()
    }
  }

  const handleSearch = async() => {
    if (!searchVal) return
    setSearchLoading(true)
    const data = await searchSource({
      source: searchType,
      text: searchVal,
    })
    setSearchLoading(false)
    if (data.channels.length > 0) {
      setSearchRes(data.channels)
    } else setEmpty(true)
  }

  useEffect(() => {
    const getHotList = async() => {
      const data = await getHotCollections()
      data?.channels && setHotList(data.channels)
    }
    getHotList()
  }, [])

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('discovery')}</p>

      {/* type radio */}
      <div
        className={styles.group}
        onChange={(e) => setSearchType(e.target.value)}
      >
        {
          typeList.map(item => (
            <React.Fragment key={item}>
              <input
                type="radio"
                id={item}
                name="searchType"
                value={item}
                checked={searchType === item}
                readOnly
              />
              <label htmlFor={item}>
                {t(item)}
              </label>
            </React.Fragment>
          ))
        }
      </div>

      {/* 搜索框 */}
      <div className={styles.searchWrap}>
        <form className={styles.search} action=".">
          <Input
            className={styles.input}
            type="search"
            placeholder={placeholder(searchType)}
            value={searchVal}
            onChange={(val) => {
              if (!val) {
                setSearchRes({})
                setEmpty(false)
              }
              setSearchVal(val)
            }}
            onClear={() => {
              setSearchRes([])
              setEmpty(false)
            }}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </form>

        <div className={styles.searchIcon}>
          {searchLoading ? (
            <div className={styles.loadingWrap}>
              <Loading size={18} className={styles.searchLoading} />
            </div>
          ) : (
            <Icon type="search" onClick={async () => handleSearch()} />
          )}
        </div>
      </div>

      {/* Search Result */}
      <div>
        {searchRes.length > 0 &&
          searchRes.map((item) => (
            <Card t={t} item={item} />
          ))
        }
        {
          empty && <p className={styles.empty}>🧶 {t('no_search_result')}</p>
        }
      </div>

      {/* hot collections */}
      <p className={styles.sectionTitle}># {t('channel_list')}</p>
      <div className={styles.collections}>
        {
          hotList.length > 0 && hotList.map((item) => (
            <Card t={t} item={item} />
          ))
        }
      </div>

      <OwlToast />
    </div>
  )
}

export default Discovery
