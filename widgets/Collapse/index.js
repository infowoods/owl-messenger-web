import { useState } from 'react'

import styles from './index.module.scss'

import { RiArrowDropRightLine } from 'react-icons/ri'

function Collapse(props) {
  const { className, title, remark, children, data_id } = props

  const [active, setActive] = useState(false)

  return (
    <div className={`${styles.collapse} ${className}`} data_id={data_id}>
      <div
        className={`${styles.card} ${active && styles.cardActive}`}
        onClick={() => setActive(!active)}
      >
        <div className={styles.title}>
          {title}
          {remark && <span>{remark}</span>}
        </div>
        <RiArrowDropRightLine
          className={`${styles.arrow} ${active && styles.arrowActive}`}
        />
      </div>
      {active && (
        <div className={styles.children}>
          <div className={styles.child}>{children}</div>
        </div>
      )}
    </div>
  )
}

export default Collapse
