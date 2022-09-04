import Loading from '../Loading'
import PropTypes from 'prop-types'
import styles from './index.module.scss'

function Button(props) {
  const {
    className,
    children,
    type,
    size,
    disabled,
    loading,
    ...others
  } = props

  return (
    <button
      className={`${styles.button} ${styles[type]} ${styles[size]} ${className}`}
      disabled={disabled}
      {...others}
    >
      {
        loading ? <Loading className={styles.loading} size={17} /> : children
      }
    </button>
  )
}

Button.defaultProps = {
  type: 'primary',
  size: 'small',
  loading: false,
  disabled: false,
}

Button.propTypes = {
  type: PropTypes.oneOf(['primary', 'text']),
  size: PropTypes.oneOf(['large', 'small']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
}

export default Button
