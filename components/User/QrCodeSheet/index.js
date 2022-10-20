import BottomSheet from '../../../widgets/BottomSheet'
import styles from './index.module.scss'
const QRCode = require('qrcode.react')

function QrCodeSheet(props) {
  const { t, value, showing, onClose } = props

  return (
    <BottomSheet onClose={onClose} showing={showing}>
      <div className={styles.qrcode}>
        <QRCode
          value={value}
          size={240}
          imageSettings={{
            src: '/mixin-logo.png',
            width: 50,
            height: 50,
          }}
        />
      </div>
    </BottomSheet>
  )
}

export default QrCodeSheet
