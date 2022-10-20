import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { RiFileCopyLine, RiArrowLeftSLine } from 'react-icons/ri'
import { TbMailbox } from 'react-icons/tb'
import { Collapse } from '@nextui-org/react'

import {
  getSubscriptions,
  unsubscribeChannel,
} from '../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../utils/apiUtils'

import { copyText } from '../../../utils/copyUtil'
import SourceIcon from '../../../widgets/SourceIcon'
import Empty from '../../../widgets/Empty'
import Loading from '../../../widgets/Loading'
import { CurrentLoginContext } from '../../../contexts/currentLogin'
const Toast = dynamic(() => import('../../../widgets/Toast'))

import styles from './index.module.scss'

function Subscriptions() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)

  function useMySubscriptions() {
    const { data, error } = useSWR('subscriptions?enabled', getSubscriptions)
    if (error) {
      if (error) {
        handleInfowoodsApiError(error, t, curLogin)
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
          handleInfowoodsApiError(error, t, curLogin)
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
      {mySubscriptions.isLoading && <Loading size="lg" />}
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
          {mySubscriptions?.data?.subscriptions?.length > 0 && (
            <Collapse.Group splitted>
              {mySubscriptions.data.subscriptions.map((item, index) => {
                return (
                  <Collapse
                    className={styles.collapse}
                    title={item.channel.title}
                    key={index}
                    data_id={item.channel.id}
                    arrowIcon={<RiArrowLeftSLine />}
                  >
                    <>
                      <div className={styles.description}>
                        {item.channel.description && item.channel.description}
                      </div>
                      <div className={styles.uri}>
                        <SourceIcon uri={item.channel.uri} />
                        <span onClick={() => copyText(item.channel.uri, t)}>
                          {item.channel.uri}
                        </span>
                      </div>
                      <div className={styles.buttons}>
                        <div>
                          <button
                            className={styles.button}
                            onClick={(event) => {
                              toUnsubscribeChannel(
                                event,
                                t,
                                item.channel.id,
                                index
                              )
                            }}
                          >
                            {t('unsubscribe')}
                          </button>
                        </div>
                      </div>
                    </>
                  </Collapse>
                )
              })}
            </Collapse.Group>
          )}
        </>
      )}

      <Toast />
    </div>
  )
}

export default Subscriptions
