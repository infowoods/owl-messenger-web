import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { RiFileCopyLine } from 'react-icons/ri'
import { TbMailbox } from 'react-icons/tb'

import { handelOwlApiError } from '../../../utils/apiUtils'
import { getSubscriptions, unsubscribeChannel } from '../../../services/api/owl'
import { copyText } from '../../../utils/copyUtil'

import Empty from '../../../widgets/Empty'
import Collapse from '../../../widgets/Collapse'
import Loading from '../../../widgets/Loading'
import { CurrentLoginContext } from '../../../contexts/currentLogin'
const OwlToast = dynamic(() => import('../../../widgets/OwlToast'))

import styles from './index.module.scss'

function Subscriptions() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)

  function useMySubscriptions() {
    const { data, error } = useSWR('subscriptions?enabled', getSubscriptions)
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

  function toUnsubscribeChannel(event, t, channel_id) {
    // event.target.innerHTML = t('unsubscribing')
    event.target.innerHTML = t('unsubscribing')

    event.target.disabled = true

    const card = document.querySelector(`div[data_id='${channel_id}']`)

    unsubscribeChannel(channel_id)
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

  const mySubscriptions = useMySubscriptions()

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}>
        <TbMailbox /> {t('my-subscriptions')}
      </p>
      {mySubscriptions.isLoading && (
        <Loading size={40} className={styles.loading} />
      )}
      {mySubscriptions.data && (
        <>
          {mySubscriptions.data?.subscriptions?.length === 0 && (
            <Empty
              text={t('no_records')}
              mainClass={styles.empty}
              imageClass={styles.emptyImage}
              textClass={styles.emptyText}
            />
          )}
          {mySubscriptions?.data?.subscriptions?.length > 0 &&
            mySubscriptions.data.subscriptions.map((item, index) => {
              return (
                <Collapse
                  className={styles.channelCard}
                  title={item.channel.title}
                  key={item.channel.id}
                  data_id={item.channel.id}
                >
                  <>
                    {item.channel.description && (
                      <p className={styles.channelDesc}>
                        <span>
                          {t('desc')}
                          {t('colon')}
                        </span>
                        {item.channel.description}
                      </p>
                    )}
                    <div className={styles.copy}>
                      <p>
                        <span>
                          {t('channel_uri')}
                          {t('colon')}
                        </span>
                        <span
                          onClick={() => copyText(item.channel.uri, toast, t)}
                        >
                          {item.channel.uri} <RiFileCopyLine />
                        </span>
                      </p>
                    </div>
                    <div
                      className={`${styles.detail} ${styles.increaseMargin}`}
                    >
                      <button
                        className={styles.button}
                        onClick={(event) => {
                          toUnsubscribeChannel(event, t, item.channel.id, index)
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
