import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { RiCloseCircleLine } from 'react-icons/ri'
import styles from './index.module.scss'

function Input(props) {
  const {
    className,
    title,
    extra,
    prefix,
    suffix,
    type,
    value,
    disabled,
    onChange,
    onFocus,
    onBlur,
    onClear,
    onKeyDown,
    ...inputProps
  } = props

  const [, changeValue] = useState()
  const [focus, setFocus] = useState(false)
  const inputRef = useRef()

  const specialClass =
    (focus ? styles.focus : '') + (disabled ? styles.disabled : '')

  useEffect(() => {
    if (!value) return
    onChange(value)
  }, [value])

  const handleOnFocus = (e) => {
    setFocus(true)
    onFocus && onFocus(e)
  }

  const handleOnChange = (e) => {
    const realValue = e.target.value
    value !== realValue ? onChange(realValue) : changeValue({})
  }

  const handleOnBlur = (e) => {
    setFocus(false)
    onBlur && onBlur(e)
  }

  const handleOnKeyDown = (e) => {
    onKeyDown && onKeyDown(e)
  }

  const handleOnClear = (e) => {
    onChange('')
    onClear && onClear(e)
  }

  return (
    <div className={`${styles.input} ${className} ${specialClass}`}>
      {title && (
        <div className={styles.title}>
          <strong className={styles.label}>{title}</strong>
          {extra && extra}
        </div>
      )}

      <div className={styles.row}>
        {prefix && prefix}

        <input
          ref={inputRef}
          type={type}
          size="1"
          value={value}
          {...inputProps}
          onFocus={handleOnFocus}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onKeyDown={handleOnKeyDown}
        />

        {focus && value !== '' && (
          <RiCloseCircleLine
            className={styles.clear}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOnClear}
          />
        )}

        {suffix && suffix}
      </div>
    </div>
  )
}

Input.propTypes = {
  className: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.oneOf(['text', 'number', 'password', 'digital', 'search']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onClear: PropTypes.func,
  disabled: PropTypes.bool,
  extra: PropTypes.element, // label右侧额外元素，如密码强度标识
  suffix: PropTypes.element, // 输入框右侧，清除按钮后的额外元素
  prefix: PropTypes.element, // 输入框左侧额外元素，如$
}

Input.defaultProps = {
  className: '',
  type: 'text',
  value: '',
  disabled: false,
  onChange: () => {},
}

export default Input
