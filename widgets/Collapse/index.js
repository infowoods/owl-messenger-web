import { useState } from 'react'
import Icon from '../Icon'
import styles from './index.module.scss'

function Collapse(props) {
  const {
    className,
    title,
    remark,
    children,
  } = props

  const [ active, setActive ] = useState(false)

  return (
    <div className={`${styles.collapse} ${className}`}>
      <div
        className={`${styles.card} ${active && styles.cardActive}`}
        onClick={() => setActive(!active)}
      >
        <div className={styles.title}>
          {title}
          {
            remark &&
            <span>{remark}</span>
          }
        </div>
        <Icon
          type="arrow-right"
          className={`${styles.arrow} ${active && styles.arrowActive}`}
        />
      </div>
      {
        active &&
        <div className={styles.children}>
          <div className={styles.child}>
            {children}
          </div>
        </div>
      }
    </div>
  )
}

export default Collapse