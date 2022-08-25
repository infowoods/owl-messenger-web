import { useState } from 'react'
import { useTranslation } from 'next-i18next'

import Input from '../../widgets/Input'
import Icon from '../../widgets/Icon'

import { searchSource } from '../../services/api/owl'

import styles from './index.module.scss'
import Loading from '../../widgets/Loading'

function Discovery() {
  const { t } = useTranslation('common')
  const [searchType, setSearchType] = useState('channel')
  const [searchVal, setSearchVal] = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [empty, setEmpty] = useState(false)

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

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}># {t('discovery')}</p>

      <div
        className={styles.group}
        onChange={(e) => setSearchType(e.target.value)}
      >
        <input
          type="radio"
          id="channel"
          name="searchType"
          value="channel"
          checked={searchType === 'channel'}
          readOnly
        />
        <label htmlFor="channel">{t('channel')}</label>

        <input
          type="radio"
          id="weibo"
          name="searchType"
          value="weibo"
          checked={searchType === 'weibo'}
          readOnly
        />
        <label htmlFor="weibo">{t('weibo')}</label>
      </div>

      {/* 搜索框 */}
      <div className={styles.searchWrap}>
        <form className={styles.search} action=".">
          <Input
            className={styles.input}
            type="search"
            placeholder={placeholder(searchType)}
            value={searchVal}
            onChange={(val) => setSearchVal(val)}
            onClear={() => {
              setSearchRes([])
              setEmpty(false)
            }}
            // onKeyDown={(e) => handleKeyDown(e)}
          />
        </form>

        <div className={styles.searchIcon}>
          {searchLoading ? (
            <div className={styles.loadingWrap}>
              <Loading size={18} className={styles.searchLoading} />
            </div>
          ) : (
            <Icon
              type="search"
              onClick={async () => {
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
              }}
            />
          )}
        </div>
      </div>

      <div>
        {searchRes.length > 0 &&
          searchRes.map((item) => {
            return (
              <div key={item.id} className={styles.card}>
                <p className={styles.channelTitle}>{item.title}</p>
                <p className={styles.channelDesc}>{t('desc')}{t('colon')}{item.description}</p>
                <div className={styles.channelFee}>
                  <p>
                    {t('channel_fee')}
                    {item.price_per_info.channel_fee} NUT
                  </p>
                  <div>
                    <p>
                      {t('min')}
                      {item.price_per_info.pushing_fee.min} NUT
                    </p>
                    <p>
                      {t('min')}
                      {item.price_per_info.pushing_fee.max} NUT
                    </p>
                  </div>
                </div>
                <p className={styles.copy}>{t('source_uri')}{t('colon')}{item.uri}</p>
                <button className={styles.button}>{t('follow')}</button>
              </div>
            )
          })}
          {
            empty && <p className={styles.empty}>🧶 {t('no_search_result')}</p>
          }
      </div>

      <p className={styles.sectionTitle}># {t('channel_list')}</p>
      <p className={styles.channelDesc}>👨‍💻‍ {t('coming_soon')}</p>
    </div>
  )
}

export default Discovery
