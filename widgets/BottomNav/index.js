import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { RiHomeFill, RiSearch2Fill, RiUser4Fill } from 'react-icons/ri'

const Toast = dynamic(() => import('../Toast'))
import { APPS } from '../../constants'

import styles from './index.module.scss'

function BottomNav({ ctx, t, curLogin }) {
  const { pathname, push } = useRouter()
  const navHref = APPS[APPS.current].bottom_nav_href

  return (
    <div className={styles.bottomNav}>
      <div>
        {navHref.map((href, index) => (
          <div
            key={index}
            className={`${pathname === href ? styles.active : styles.default} ${
              styles.button
            }`}
            onClick={() => {
              if (!curLogin.token) {
                toast(t('login_first'), { icon: '💁' })
                return
              }
              push(href)
            }}
          >
            {href === '/' && <RiHomeFill className={styles.icon} />}
            {href === '/discovery' && <RiSearch2Fill className={styles.icon} />}
            {href === '/user' && <RiUser4Fill className={styles.icon} />}
            <p className={styles.label}>{t(href)}</p>
          </div>
        ))}
      </div>

      <Toast />
    </div>
  )
}

export default BottomNav
