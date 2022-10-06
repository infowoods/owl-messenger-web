import { RiArrowDropRightLine } from 'react-icons/ri'
import styles from './index.module.scss'
import { useRouter } from 'next/router'

function SubPageCard(props) {
  const { className, LeftIcon, title, description, path, children } = props

  const router = useRouter()

  return (
    <>
      <div
        className={`${styles.subPageCard} ${className}`}
        onClick={() => {
          router.push(path)
        }}
      >
        <div className={styles.left}>{LeftIcon && <LeftIcon />}</div>
        <div className={styles.middle}>
          {title && <div className={styles.title}>{title}</div>}
          {description && (
            <div className={styles.description}>{description}</div>
          )}
          {children && <div className={styles.children}>{children}</div>}
        </div>
        <div className={styles.right}>
          <RiArrowDropRightLine className={`${styles.arrow}`} />
        </div>
      </div>
    </>
  )
}

export default SubPageCard
