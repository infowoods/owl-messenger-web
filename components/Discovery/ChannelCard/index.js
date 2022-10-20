import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Card, Text } from '@nextui-org/react'
import { RiLinksLine, RiMoneyDollarCircleLine } from 'react-icons/ri'

import { subscribeChannel } from '../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../utils/apiUtils'
import { formatAdd, formatNum } from '../../../utils/numberUtil'
import { copyText } from '../../../utils/copyUtil'
import SourceIcon from '../../../widgets/SourceIcon'

import styles from './index.module.scss'

function ChannelCard(props) {
  const { curLogin, t, channel } = props

  function toSubscribeChannel(event, t, channel_id) {
    event.target.innerHTML = t('subscribing')
    event.target.disabled = true

    subscribeChannel(channel_id)
      .then(() => {
        toast.success(t('subscribe_success'))
        event.target.innerHTML = '✓' + t('subscribed')
      })
      .catch((error) => {
        handleInfowoodsApiError(error, t, curLogin)
        event.target.disabled = false
        event.target.innerHTML = t('subscribe')
      })
  }

  return (
    <>
      {channel?.id && (
        <>
          <Card className={styles.card} variant="flat">
            <div className={styles.title}>
              <div className={styles.sourceIcon}>
                <SourceIcon uri={channel.uri} />
              </div>
              <div className={styles.text}>{channel.title}</div>
            </div>

            {channel.description && (
              <div className={styles.description}>{channel.description}</div>
            )}

            <div className={styles.price}>
              <div className={styles.numbers} title={t('how_to_charge')}>
                <RiMoneyDollarCircleLine />
                {t('price_per_info')}
                {': '}
                {formatAdd(
                  channel.price_per_info.channel_fee,
                  channel.price_per_info.pushing_fee.min,
                  3
                )}
                {'~'}
                {formatAdd(
                  channel.price_per_info.channel_fee,
                  channel.price_per_info.pushing_fee.max,
                  3
                )}
                {' NUT / '}
                {t('each_info')}
              </div>
              <div className={styles.composition}>
                {'('}
                {t('price_composition')}
                {': '}
                {t('channel_fee')} {channel.price_per_info.channel_fee}
                {', '}
                {t('pushing_fee')} {channel.price_per_info.pushing_fee.min}
                {'~'}
                {channel.price_per_info.pushing_fee.max}
                {')'}
              </div>
            </div>

            <div className={styles.uri}>
              <RiLinksLine />
              <span onClick={() => copyText(channel.uri, t)}>
                {channel.uri}
              </span>
            </div>

            <div className={styles.buttons}>
              {channel.subscription?.enabled ? (
                <button disabled>{t('subscribed')}</button>
              ) : (
                <button
                  onClick={(event) => {
                    toSubscribeChannel(event, t, channel.id)
                  }}
                >
                  {t('subscribe')}
                </button>
              )}
            </div>
          </Card>
        </>
      )}
    </>
  )
}

export default ChannelCard
