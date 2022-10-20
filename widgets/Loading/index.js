import PropTypes from 'prop-types'
import styles from './index.module.scss'

function Loading({ className, color, size }) {
  return (
    <div className={`${className} ${styles.wrap}`}>
      <div className={`${styles.icon} ${styles[color]} ${styles[size]}`}></div>
    </div>
  )
}

Loading.defaultProps = {
  color: 'primary',
  size: 'md',
}

Loading.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'accent']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg','xl']),
}

export default Loading
