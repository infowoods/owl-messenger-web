import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import Icon from '../../widgets/Icon'
const BottomSheet = dynamic(() => import('../../widgets/BottomSheet'))

import storageUtil from '../../utils/storageUtil'

import styles from './index.module.scss'
import favImg from '../../public/favicon.png'
import favImgOak from '../../public/favicon-oak.png'

function TopBar(props) {
  const { url } = props
  const { t } = useTranslation('common')
  const router = useRouter()
  const [show, setShow] = useState(false)

  const botList = {
    oak: {
      id: 'b9fee5b9-b3cb-4448-9f31-a6440ba21bf8',
      url: 'https://exquisite-kleicha-433ec6.netlify.app',
    },
  }

  const handleClose = () => setShow(false)

  const handleBotClick = (name) => {
    setShow(false)
    if (storageUtil.get('platform') === 'browser') {
      window.open(botList[name].url)
    } else {
      window.open(`mixin://apps/${botList[name].id}`)
    }
  }

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
      <div
        className={`${styles.icon} ${url && styles.iconPadding}`}
        onClick={() => setShow(true)}
      >
        <Image src={favImg} alt="favico" width={28} height={28} />
        <span>Owl Deliver</span>
        <Icon
          type="arrow-right"
          className={show ? styles.active : styles.inactive}
        />
      </div>

      <BottomSheet
        t={t}
        show={show}
        onClose={handleClose}
        onCancel={handleClose}
      >
        <div className={styles.botWrap}>
          <div className={styles.bot} onClick={() => handleBotClick('oak')}>
            <Image
              src={favImgOak}
              alt="oak hub"
              width={38}
              height={38}
              layout="fixed"
            />
            <div>
              <p>{t('oak')}</p>
              <p>{t('oak_desc')}</p>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export default TopBar
