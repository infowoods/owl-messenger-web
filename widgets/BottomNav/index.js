import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import Icon from '../Icon'

import toast from 'react-hot-toast'
const OwlToast = dynamic(() => import('../OwlToast'))

import styles from './index.module.scss'

function BottomNav({ t, isLogin }) {
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
            }`}
            onClick={() => {
              if (!isLogin) {
                toast('Login first', { icon: '💁' })
                return
              }
              push(item.href)
            }}
          >
            <Icon type={item.icon} />
            <p>{t(item.name)}</p>
          </div>
        ))}
      </div>

      <OwlToast />
    </div>
  )
}

export default BottomNav
