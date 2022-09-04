import { useRouter } from 'next/router'
import Image from 'next/image'

import Icon from '../../widgets/Icon'

import styles from './index.module.scss'

function TopBar(props) {
  const { url } = props
  const router = useRouter()

  return (
    <div className={styles.bar}>
      {url && (
        <Icon
          className={styles.back}
          type="arrow-right"
          onClick={() => {
            router.push(url)
          }}
        />
      )}
      <div className={`${styles.icon} ${url && styles.iconPadding}`}>
        <Image src="/favicon.png" alt="favico" width={28} height={28} />
        <span>Owl Messenger</span>
      </div>
    </div>
  )
}

export default TopBar
