import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Image from 'next/image'

import { RiArrowLeftLine } from 'react-icons/ri'

import styles from './index.module.scss'

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

  // const handleClose = () => setShow(false)

  // const handleBotClick = (name) => {
  //   setShow(false)
  //   if (storageUtil.get('platform') === 'browser') {
  //     window.open(botList[name].url)
  //   } else {
  //     window.open(`mixin://apps/${botList[name].id}`)
  //   }
  // }

  return (
    <div className={styles.bar}>
      {url && (
        <RiArrowLeftLine
          className={styles.back}
          onClick={() => {
            router.push(url)
          }}
        />
      )}
      <div className={`${styles.icon} ${url && styles.iconPadding}`}>
        <Image src="/favicon.png" alt="favicon" width={28} height={28} />
        <span>Owl Messenger</span>
      </div>
    </div>
  )
}

export default TopBar
