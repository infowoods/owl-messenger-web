import React from 'react'
import { RiArrowRightLine } from 'react-icons/ri'
import classnames from 'classnames'
const Selector = (props) => {
  const {
    title,
    className,
    buttonTextClassName,
    disabled,
    placeholder,
    open,
    values,
    onSearch,
    onToggleOpen,
    enableSearch,
    searchValue,
    isCountryCode,
  } = props
  const item = values.length > 0 && values[0]
  let inputValue = item && (item.children || item.label)

  if (isCountryCode) {
    inputValue = inputValue.replace(/[a-zA-Z]+/, '')
  }

  const hasTextInput = !!inputValue

  const inputRef = React.useRef(null)

  const handleButtonClick = () => {
    if (enableSearch && !disabled) {
      if (!open) {
        inputRef.current.focus()
      } else {
        inputRef.current.blur()
      }
    }
    onToggleOpen(!open)
  }

  const onInputChange = ({ target: { value } }) => {
    onSearch(value)
  }

  const buttonClass = React.useMemo(() => {
    return classnames('Select-button', className, {
      'active-button': open,
      'disabled-button': disabled,
    })
  }, [open, disabled, className])

  const renderNomalSelector = () => (
    <div
      class={`button-text ${buttonTextClassName} ${
        !hasTextInput && 'LightGray'
      }`}
    >
      {!hasTextInput ? placeholder : inputValue}
    </div>
  )

  const renderInputSelector = () => (
    <div class="input-wrapper">
      <input
        ref={inputRef}
        class="input"
        onChange={onInputChange}
        value={searchValue}
      />
      <span
        class={classnames('input-text', {
          LightGray: !hasTextInput,
          'open-opacity': open,
        })}
      >
        {!searchValue ? (!hasTextInput ? placeholder : inputValue) : null}
      </span>
    </div>
  )

  return (
    <div class={buttonClass} onClick={handleButtonClick}>
      {title && (
        <div class="title">
          <strong>{title}</strong>
        </div>
      )}
      <div class="selector">
        {enableSearch && !disabled
          ? renderInputSelector()
          : renderNomalSelector()}
        <RiArrowRightLine class={`arrow ${open && 'arrow-up'}`} />
      </div>
    </div>
  )
}

export default Selector
