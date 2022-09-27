import useSWR from 'swr'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
const OwlToast = dynamic(() => import('../../widgets/OwlToast'))

import Input from '../../widgets/Input'
import Icon from '../../widgets/Icon'
import Loading from '../../widgets/Loading'

import {
  searchSource,
  getCollection,
  subscribeChannel,
} from '../../services/api/owl'

import { copyText } from '../../utils/copyUtil'

import styles from './index.module.scss'

function useHotCollection() {
  const { data, error } = useSWR('hot', getCollection)
  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function toSubscribeChannel(event, t, channel_id) {
  event.target.innerHTML = t('subscribing')
  // <Loading className={styles.followLoading} size={16} />
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

const Card = ({ t, item }) => {
  return (
    <>
      <div key={item.id} className={styles.card}>
        <p className={styles.channelTitle}>{item.title}</p>

        <p className={styles.channelDesc}>
          <span>
            {t('desc')}
            {t('colon')}
          </span>
          {item.description}
        </p>
        <p className={styles.copy}>
          <span>
            {t('channel_uri')}
            {t('colon')}
          </span>
          <span onClick={() => copyText(item.uri, toast, t)}>
            {item.uri} <Icon type="copy" />
          </span>
        </p>

        {/* Price */}
        <div className={styles.channelFee}>
          <p className={styles.infoPrice}>
            <span>
              {t('price_per_info')}
              {': '}
            </span>
            {Math.round(
              (parseFloat(item.price_per_info.channel_fee) +
                parseFloat(item.price_per_info.pushing_fee.min)) *
                1000
            ) / 1000}
            {' ~ '}
            {Math.round(
              (parseFloat(item.price_per_info.channel_fee) +
                parseFloat(item.price_per_info.pushing_fee.max)) *
                1000
            ) / 1000}
            {' NUT'}
          </p>
          <p className={styles.priceDetail}>
            {'('}
            {t('channel_info_price')}
            {': '}
            {item.price_per_info.channel_fee == 0
              ? t('free_price')
              : `${item.price_per_info.channel_fee} NUT`}
            {', '}
            {t('pushing_info_price')}
            {': '}
            {item.price_per_info.pushing_fee.min}
            {' ~ '}
            {item.price_per_info.pushing_fee.max}
            {' NUT)'}
          </p>
        </div>

        {/* Button of Subscribe */}
        {item.subscription.enabled ? (
          <span>✓ {t('subscribed')}</span>
        ) : (
          <button
            className={styles.button}
            onClick={(event) => {
              toSubscribeChannel(event, t, item.id)
            }}
          >
            {t('subscribe')}
          </button>
        )}
      </div>
    </>
  )
}

function Discovery() {
  const { t } = useTranslation('common')
  const [searchType, setSearchType] = useState('channel')
  const [searchVal, setSearchVal] = useState('')
  const [searchRes, setSearchRes] = useState([])

  const [searchLoading, setSearchLoading] = useState(false)
  const [empty, setEmpty] = useState(false)
  const typeList = ['channel', 'weibo', 'twitter']
  const hotCollection = useHotCollection()

  const placeholder = (type) => {
    switch (type) {
      case 'channel':
        return t('channel_search_ph')
      case 'weibo':
        return t('weibo_search_ph')
      case 'twitter':
        return t('twitter_search_ph')
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

  const handleSearch = async () => {
    if (!searchVal) return
    setEmpty(false)
    setSearchLoading(true)
    try {
      const data = await searchSource(searchType, searchVal)
      if (data.channels.length > 0) {
        setSearchRes(data.channels)
      } else {
        setEmpty(true)
        setSearchRes([])
      }
      setSearchLoading(false)
    } catch (err) {
      toast.error(t(err?.message))
      setSearchLoading(false)
      return
    }
  }

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('discovery')}</p>

      {/* type radio */}
      <div
        className={styles.group}
        onChange={(e) => setSearchType(e.target.value)}
      >
        {typeList.map((item) => (
          <React.Fragment key={item}>
            <input
              type="radio"
              id={item}
              name="searchType"
              value={item}
              checked={searchType === item}
              readOnly
            />
            <label htmlFor={item}>{t(item)}</label>
          </React.Fragment>
        ))}
      </div>

      {/* 搜索框 */}
      <div className={styles.searchWrap}>
        <form className={styles.searchForm} action=".">
          <Input
            className={styles.input}
            type="search"
            placeholder={placeholder(searchType)}
            value={searchVal}
            onChange={(val) => {
              if (!val) {
                setSearchRes([])
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
          searchRes.map((item) => <Card key={item.id} t={t} item={item} />)}
        {empty && <p className={styles.empty}>🧶 {t('no_search_result')}</p>}
      </div>

      {/* hot collection */}
      <p className={styles.sectionTitle}># {t('hot_channels')}</p>
      {hotCollection?.isLoading ? (
        <Loading className={styles.hotLoading} />
      ) : (
        <div className={styles.collection}>
          {hotCollection?.data?.channels &&
            hotCollection.data.channels.map((item) => (
              <Card key={item.id} t={t} item={item} />
            ))}
        </div>
      )}

      <OwlToast />
    </div>
  )
}

export default Discovery
