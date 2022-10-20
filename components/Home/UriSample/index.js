import toast from 'react-hot-toast'
import { Collapse } from '@nextui-org/react'

import { copyText } from '../../../utils/copyUtil'
import SourceIcon from '../../../widgets/SourceIcon'

import styles from './index.module.scss'

function toCopyText(event, t) {
  var elm = event.target
  const text = elm.innerText || elm.textContent
  copyText(text, t)
}

function UriSample(props) {
  const { ctx, t, curLogin } = props

  return (
    <>
      <Collapse className={styles.wrap} title={t('uri_samples')} bordered>
        <div>
          <div className={styles.uri_type}>
            <SourceIcon name="channel" />
            {t('och_uri')}:
          </div>
          <div className={styles.uri_items}>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              och://channel/dccdaf9960f043ababafa095b7da0f23
            </span>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              och://channel/6c03de0721c240fc9499343b66ee1b08
            </span>
          </div>
        </div>

        <div>
          <div className={styles.uri_type}>
            {' '}
            <SourceIcon name="rss" /> {t('rss_url')}:
            <div className={styles.uri_items}>
              <span
                className={styles.uri_item}
                onClick={(e) => {
                  toCopyText(e, t)
                }}
              >
                https://docs.pando.im/blog/rss
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.uri_type}>
            {' '}
            <SourceIcon name="twitter" /> {t('twitter_url')}:
          </div>
          <div className={styles.uri_items}>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              https://twitter.com/elonmusk
            </span>
          </div>
        </div>

        <div>
          <div className={styles.uri_type}>
            {' '}
            <SourceIcon name="weibo" /> {t('weibo_url')}:
          </div>
          <div className={styles.uri_items}>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              https://weibo.com/u/1576218000
            </span>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              https://weibo.com/bylixiaolai
            </span>
          </div>
        </div>

        <div>
          <div className={styles.uri_type}>
            {' '}
            <SourceIcon name="mirrorxyz" /> {t('mirrorxyz_url')}:
          </div>
          <div className={styles.uri_items}>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              https://dev.mirror.xyz
            </span>
            <span
              className={styles.uri_item}
              onClick={(e) => {
                toCopyText(e, t)
              }}
            >
              https://mirror.xyz/0x9651B2a7Aa9ed9635cE896a1Af1a7d6294d5e902
            </span>
          </div>
        </div>
      </Collapse>
    </>
  )
}

export default UriSample
