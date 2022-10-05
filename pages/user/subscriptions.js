import Subscriptions from '../../components/Subscriptions'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
const i18nConfig = require('../../next-i18next.config')

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], i18nConfig)),
    },
  }
}
export default Subscriptions
