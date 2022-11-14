import useSWR from 'swr'
import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Input, useInput, Radio } from '@nextui-org/react'
import { RiSearchLine, RiInformationFill } from 'react-icons/ri'

import { sourceSearch, getCollection } from '../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../utils/apiUtils'
import { ignoreEvent } from '../../utils/pageUtil'
import { CurrentLoginContext } from '../../contexts/currentLogin'
import Loading from '../../widgets/Loading'
import SourceIcon from '../../widgets/SourceIcon'

const Toast = dynamic(() => import('../../widgets/Toast'))
const ChannelCard = dynamic(() => import('./ChannelCard'))

import styles from './index.module.scss'

function Discovery() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)

  const [searchType, setSearchType] = useState('channel')
  const keywords = useInput('')
  const [searchResult, setSearchResult] = useState([])
  const [errorTip, setErrorTip] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const sourceTypeList = ['channel', 'weibo', 'twitter']

  function useHotCollection() {
    const { data, error } = useSWR('hot', getCollection)
    if (error) {
      handleInfowoodsApiError(error, t, curLogin)
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
    }
  }

  const hotCollection = useHotCollection()

  function useRandomCollection() {
    const { data, error } = useSWR('random', getCollection)
    if (error) {
      handleInfowoodsApiError(error, t, curLogin)
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
    }
  }
  const randomCollection = useRandomCollection()

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

  const onKeyDown = (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed) {
      handleSearch()
    }
  }

  const handleSearch = () => {
    if (isSearching) return
    if (!keywords.value) return

    setErrorTip('')
    setIsSearching(true)
    sourceSearch({ sourceType: searchType, searchVal: keywords.value })
      .then((data) => {
        if (data.channels.length > 0) {
          setSearchResult(data.channels)
        } else {
          setErrorTip(t('no_search_result'))
          setSearchResult([])
        }
      })
      .catch((error) => {
        const msg = handleInfowoodsApiError(error, t, curLogin)
        setErrorTip(msg)
      })
      .finally(() => {
        setIsSearching(false)
      })
  }

  return (
    <div className={styles.main}>
      <div className={styles.sectionTitle}>{t('search')}</div>

      <div className={styles.findWrap}>
        {/* type radio */}

        <Radio.Group
          aria-label="type-options"
          defaultValue="channel"
          orientation="horizontal"
          className={styles.typeOptions}
          onChange={setSearchType}
        >
          {sourceTypeList.map((value, index) => (
            <Radio key={index} value={value}>
              <SourceIcon name={value} />
              {t(value)}
            </Radio>
          ))}
        </Radio.Group>

        {/* 搜索框 */}
        <form
          action="#"
          className={styles.searchWrap}
          onBlur={ignoreEvent}
          onSubmit={(e) => {
            ignoreEvent(e), handleSearch()
          }}
        >
          <Input
            className={styles.input}
            aria-label="search_input"
            type="search"
            clearable
            bordered
            size="xl"
            placeholder={placeholder(searchType)}
            value={keywords.value}
            onChange={(e) => {
              if (!e.target.value) {
                setSearchResult([])
                setErrorTip('')
              }
              keywords.setValue(e.target.value)
            }}
            onClearClick={() => {
              setSearchResult([])
              setErrorTip('')
            }}
            fullWidth={true}
            contentLeft={<RiSearchLine />}
            onKeyDown={onKeyDown}
            onBlur={ignoreEvent}
          />
        </form>
      </div>

      {isSearching && (
        <div className={styles.loadingWrap}>
          <Loading size="md" />
          <div className={styles.loadingHint}>{t('waiting_searching')}</div>
        </div>
      )}

      {errorTip !== '' && (
        <div className={`${styles.errorTip}`}>
          <RiInformationFill />
          <span>{errorTip}</span>
        </div>
      )}

      {searchResult?.length > 0 && (
        <>
          <div className={styles.cards}>
            {searchResult.map((item, index) => (
              // <Card key={index} t={t} item={item} />
              <ChannelCard
                key={index}
                curLogin={curLogin}
                t={t}
                channel={item}
              />
            ))}
          </div>
        </>
      )}

      {/* random collection */}
      <p className={styles.sectionTitle}>{t('random_oak_channels')}</p>
      {randomCollection?.isLoading ? (
        <Loading size="xl" />
      ) : (
        <div className={styles.collection}>
          {randomCollection?.data?.channels &&
            randomCollection.data.channels.map((item) => (
              <ChannelCard
                key={item.id}
                curLogin={curLogin}
                t={t}
                channel={item}
              />
            ))}
        </div>
      )}

      {/* hot collection */}
      <p className={styles.sectionTitle}>{t('hot_channels')}</p>
      {hotCollection?.isLoading ? (
        <Loading size="xl" />
      ) : (
        <div className={styles.collection}>
          {hotCollection?.data?.channels &&
            hotCollection.data.channels.map((item) => (
              <ChannelCard
                key={item.id}
                curLogin={curLogin}
                t={t}
                channel={item}
              />
            ))}
        </div>
      )}

      <Toast />
    </div>
  )
}

export default Discovery
