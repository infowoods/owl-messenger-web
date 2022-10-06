import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { TbMailbox } from 'react-icons/tb'

import { handelOwlApiError } from '../../../utils/apiUtils'
import { oldVer_GetFollows, oldVer_Unfollow } from '../../../services/api/owl'

import Collapse from '../../../widgets/Collapse'
import Loading from '../../../widgets/Loading'
import Empty from '../../../widgets/Empty'
import { CurrentLoginContext } from '../../../contexts/currentLogin'
const OwlToast = dynamic(() => import('../../../widgets/OwlToast'))

import styles from './index.module.scss'

function Subscriptions() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)

  function useOldVerFollows() {
    const { data, error } = useSWR('old-ver-get-follows', oldVer_GetFollows)
    if (error) {
      if (error) {
        handelOwlApiError(error, t, curLogin)
      }
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
    }
  }

  function toUnfollow(event, t, topic_id) {
    // event.target.innerHTML = t('unsubscribing')
    event.target.innerHTML = t('unsubscribing')

    event.target.disabled = true

    const card = document.querySelector(`div[data_id='${topic_id}']`)

    oldVer_Unfollow(topic_id)
      .then(() => {
        toast.success(t('unsubscribe_success'))
        card.style.display = 'none'
      })
      .catch((error) => {
        if (error) {
          handelOwlApiError(error, t, curLogin)
        }
        event.target.disabled = false
        event.target.innerHTML = t('unsubscribe')
      })
  }

  const myFollows = useOldVerFollows()

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}>
        <TbMailbox /> {t('old-ver-subs')}
      </p>
      {myFollows.isLoading && <Loading size={36} className={styles.loading} />}
      {myFollows.data && (
        <>
          {myFollows?.data?.follows?.length === 0 && (
            <Empty
              text={t('no_records')}
              mainClass={styles.empty}
              imageClass={styles.emptyImage}
              textClass={styles.emptyText}
            />
          )}
          {myFollows?.data?.follows?.length > 0 &&
            myFollows.data.follows.map((item, index) => {
              return (
                <Collapse
                  className={styles.channelCard}
                  title={item.title}
                  key={item.tid}
                  data_id={item.tid}
                >
                  <>
                    {item.description && (
                      <p className={styles.channelDesc}>
                        <span>
                          {t('desc')}
                          {t('colon')}
                        </span>
                        {item.description}
                      </p>
                    )}

                    <p className={styles.expiry_time}>
                      <span>
                        {t('expiry_time')}
                        {t('colon')}
                      </span>
                      {item.expiry_time}
                    </p>

                    <div
                      className={`${styles.detail} ${styles.increaseMargin}`}
                    >
                      <button
                        className={styles.button}
                        onClick={(event) => {
                          toUnfollow(event, t, item.tid, index)
                        }}
                      >
                        {t('unsubscribe')}
                      </button>
                    </div>
                  </>
                </Collapse>
              )
            })}
        </>
      )}

      <OwlToast />
    </div>
  )
}

export default Subscriptions
