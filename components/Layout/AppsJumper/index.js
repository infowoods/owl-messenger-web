import { useRouter } from 'next/router'
import Image from 'next/image'
import { APPS } from '../../../constants'
import BottomSheet from '../../../widgets/BottomSheet'
import { RiCheckLine } from 'react-icons/ri'

import styles from './index.module.scss'

function AppsJumper(props) {
  const { ctx, t, showApps, setShowApps } = props
  const router = useRouter()

  const onClick = (name) => {
    if (name === APPS.current) return
    if (ctx?.conversation_id) {
      window.open(`mixin://apps/${APPS[name].id}`)
    } else {
      window.open(APPS[name].url)
    }
    setShowApps(false)
  }

  const onClose = () => {
    setShowApps(false)
  }

  return (
    <BottomSheet onClose={onClose} showing={showApps}>
      <div className={styles.wrap}>
        <div
          className={`${styles.app} ${
            APPS.current === APPS.owl.name ? styles.selected : ''
          }`}
          onClick={() => onClick(APPS.owl.name)}
        >
          <Image
            src={APPS.owl.icon}
            alt={t(APPS.owl.title)}
            width={38}
            height={38}
          />
          <div>
            <p className={styles.title}>{t(APPS.owl.title)}</p>
            <p className={styles.desc}>{t(APPS.owl.description)}</p>
          </div>
          {APPS.current === APPS.owl.name && (
            <div className={styles.selectedIcon}>
              <RiCheckLine />
            </div>
          )}
        </div>

        <div
          className={`${styles.app} ${
            APPS.current === APPS.oak.name ? styles.selected : ''
          }`}
          onClick={() => onClick(APPS.oak.name)}
        >
          <Image
            src={APPS.oak.icon}
            alt={t(APPS.oak.title)}
            width={38}
            height={38}
          />
          <div>
            <p className={styles.title}>{t(APPS.oak.title)}</p>
            <p className={styles.desc}>{t(APPS.oak.description)}</p>
          </div>
          {APPS.current === APPS.oak.name && (
            <div className={styles.selectedIcon}>
              <RiCheckLine />
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}

export default AppsJumper
