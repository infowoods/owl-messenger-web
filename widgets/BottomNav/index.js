import { useRouter } from 'next/router'
import { useEffect, useContext, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { RiHomeFill, RiSearch2Fill, RiUser4Fill } from 'react-icons/ri'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const Toast = dynamic(() => import('../Toast'))
import styles from './index.module.scss'

function BottomNav({ ctx, t, curLogin }) {
  const { pathname, push } = useRouter()
  const navList = [
    {
      href: '/',
      name: 'home',
    },

    {
      href: '/discovery',
      name: 'discovery',
    },
    {
      href: '/user',
      name: 'me',
    },
  ]

  return (
    <div className={styles.bottomNav}>
      <div>
        {navList.map((item, idx) => (
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
            {item.name === 'home' && <RiHomeFill className={styles.icon} />}
            {item.name === 'discovery' && (
              <RiSearch2Fill className={styles.icon} />
            )}
            {item.name === 'me' && <RiUser4Fill className={styles.icon} />}
            <p className={styles.label}>{t(item.name)}</p>
          </div>
        ))}
      </div>

      <Toast />
    </div>
  )
}

export default BottomNav
