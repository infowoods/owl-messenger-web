import toast from 'react-hot-toast'
import { copyTextToClipboard } from '../services/copy-text-to-clipboard'

export function copyText(text, t) {
  if (!text) {
    toast.error(t('no_text'), { icon: '🈳️', duration: 3000 })
    return
  }
  copyTextToClipboard(text)
    .then(() => {
      toast.success(t('copy_successful'))
    })
    .catch((err) => {
      console.log('copyText error :>> ', err)
      toast.error(t('copy_failed'), { duration: 3000 })
    })
}
