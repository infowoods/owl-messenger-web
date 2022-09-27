import { copyText } from '../../../utils/copyUtil'
import Icon from '../../../widgets/Icon'
import styles from './index.module.scss'

function toCopyText(event, toast, t) {
  var elm = event.target
  const text = elm.innerText || elm.textContent
  copyText(text, toast, t)
}

function UriSampleSheet(props) {
  const { toast, t } = props

  return (
    <>
      <div className={styles.uriSample}>
        <span className={styles.title}>{t('uri_samples')}</span>

        <div className={styles.uri_type}>
          {t('och_uri')}:
          <div
            onClick={(event) => {
              toCopyText(event, toast, t)
            }}
          >
            <span className={styles.uri_item}>
              och://channel/dccdaf9960f043ababafa095b7da0f23
            </span>
            <span className={styles.uri_item}>
              och://channel/6c03de0721c240fc9499343b66ee1b08
            </span>
          </div>
        </div>

        <div className={styles.uri_type}>
          {t('rss_url')}:
          <div
            onClick={(event) => {
              toCopyText(event, toast, t)
            }}
          >
            <span className={styles.uri_item}>
              https://docs.pando.im/blog/rss
            </span>
          </div>
        </div>

        <div className={styles.uri_type}>
          {t('twitter_url')}:
          <div
            onClick={(event) => {
              toCopyText(event, toast, t)
            }}
          >
            <span className={styles.uri_item}>
              https://twitter.com/elonmusk
            </span>
          </div>
        </div>

        <div className={styles.uri_type}>
          {t('weibo_url')}:
          <div
            onClick={(event) => {
              toCopyText(event, toast, t)
            }}
          >
            <span className={styles.uri_item}>
              https://weibo.com/u/1576218000
            </span>
            <span className={styles.uri_item}>
              https://weibo.com/bylixiaolai
            </span>
          </div>
        </div>

        <div className={styles.uri_type}>
          {t('mirrorxyz_url')}:
          <div
            onClick={(event) => {
              toCopyText(event, toast, t)
            }}
          >
            <span className={styles.uri_item}>
              https://mirror.xyz/dev.mirror.xyz
            </span>
            <span className={styles.uri_item}>
              https://mirror.xyz/0x9651B2a7Aa9ed9635cE896a1Af1a7d6294d5e902
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default UriSampleSheet
