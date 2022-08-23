import { useRouter } from 'next/router'
import Icon from '../Icon'
import styles from './index.module.scss'

function BottomNav({ t }) {
  const { pathname, push } = useRouter()
  const list = [
    {
      href: '/',
      icon: 'flashlight',
      name: 'home',
    },
    {
      href: '/discovery',
      icon: 'search',
      name: 'find',
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
            onClick={() => push(item.href)}
          >
            <Icon type={item.icon} />
            <p>{t(item.name)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BottomNav
