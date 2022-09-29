import { useRouter } from 'next/router'
import { useEffect, useContext, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import Icon from '../Icon'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const OwlToast = dynamic(() => import('../OwlToast'))
import styles from './index.module.scss'

function BottomNav({ t }) {
  const [curLogin, _] = useContext(CurrentLoginContext)
  const { pathname, push } = useRouter()
  const list = [
    {
      href: '/',
      icon: 'flashlight',
      name: 'home',
    },
    {
      href: '/discovery',
      icon: 'search-fill',
      name: 'discovery',
    },
    {
      href: '/user',
      icon: 'user',
      name: 'me',
    },
  ]

  return (
    <div className={styles.bottomNav}>
      <div>
        {list.map((item, idx) => (
          <div
            key={idx}
            className={`${
              pathname === item.href ? styles.active : styles.default
            } ${styles.button}`}
            onClick={() => {
              if (!curLogin.token) {
                toast(t('login_first'), { icon: '💁' })
                return
              }
              push(item.href)
            }}
          >
            <Icon type={item.icon} />
            <p className={styles.label}>{t(item.name)}</p>
          </div>
        ))}
      </div>

      <OwlToast />
    </div>
  )
}

export default BottomNav
