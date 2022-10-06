import PropTypes from 'prop-types'
import { useEffect } from 'react'
import Image from 'next/image'
import styles from './index.module.scss'

function BottomSelection(props) {
  const {
    options, //=[{label,value,image},...]
    onSelect,
  } = props

  return (
    <div className={styles.options}>
      {options.map((item, index) => {
        return (
          <div
            className={styles.option}
            key={index}
            onClick={() => {
              onSelect(item.value)
            }}
          >
            {item.image && (
              <Image src={item.image} width={25} height={25} alt={item.label} />
            )}
            <div className={styles.label}>{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}

BottomSelection.propTypes = {
  className: PropTypes.string,
}

BottomSelection.defaultProps = {
  className: '',
}

export default BottomSelection
