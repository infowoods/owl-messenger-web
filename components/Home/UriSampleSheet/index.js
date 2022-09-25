import Icon from '../../../widgets/Icon'
import styles from './index.module.scss'

function UriSampleSheet(props) {
  const { t } = props

  return (
    <>
      <div className={styles.uriSample}>
        <div>{t('uri_samples')}</div>

        <ul>
          <div className={styles.title}>{t('och_uri')}:</div>

          <li>och://channel/dccdaf9960f043ababafa095b7da0f23</li>
          <li>och://channel/6c03de0721c240fc9499343b66ee1b08</li>
        </ul>

        <ul>
          <div className={styles.title}>{t('rss_url')}:</div>
          <li>
            <span>https://docs.pando.im/blog/rss</span>
          </li>
        </ul>

        <ul>
          <div className={styles.title}>{t('weibo_url')}:</div>
          <li>
            <span>https://weibo.com/u/1576218000</span>
            <span>https://weibo.com/bylixiaolai</span>
          </li>
        </ul>

        <ul>
          <div className={styles.title}>{t('twitter_url')}:</div>
          <li>
            <span>https://twitter.com/elonmusk</span>
          </li>
        </ul>
      </div>
    </>
  )
}

export default UriSampleSheet
