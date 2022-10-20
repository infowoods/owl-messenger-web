import styles from './index.module.scss'
import { RiCloseCircleFill } from 'react-icons/ri'

function BottomSheet(props) {
  const { className, closeAtLeft, onClose, showing, children } = props

  return (
    <>
      {showing && <div className={`${styles.overlay} ${className}`}></div>}
      <div
        className={`${styles.sheet} ${
          showing ? styles.showing : styles.hiding
        }`}
      >
        <div
          className={`${styles.close} ${closeAtLeft && styles.left}`}
          onClick={() => onClose()}
        >
          <RiCloseCircleFill />
        </div>
        <div className={styles.wrap}>
          <div className={styles.container}>{children}</div>
        </div>
      </div>
    </>
  )
}

export default BottomSheet
