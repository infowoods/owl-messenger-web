import useSWR from 'swr'
import { TbWallet } from 'react-icons/tb'
import Loading from '../../../widgets/Loading'

import styles from './index.module.scss'

function Wallets(props) {
  const { ctx, t, curLogin, myWallets, showTopupSheet, setShowTopupSheet } =
    props

  return (
    <>
      <div className={styles.wrap}>
        {myWallets.isLoading && <Loading size={'lg'} />}

        {myWallets.data && (
          <>
            <div className={styles.title}>{t('balances')}</div>
            <div className={styles.wallet}>
              <div>
                <span className={styles.val}>{myWallets.data.wallets.NUT}</span>
                {' NUT'}
                {' , '}
                <span className={styles.val}>
                  {myWallets.data.wallets.gNUT}
                </span>
                {' gNUT'}
              </div>

              <div className={styles.tip}>
                <strong>{'NUT '}</strong>
                <span>{t('nut_tip')}</span> <strong>{'gNUT '}</strong>{' '}
                <span>{t('gnut_tip')}</span>{' '}
                <span>{t('nut_spending_tip')}</span>
              </div>

              <button onClick={() => setShowTopupSheet(true)}>
                {t('top-up-nut')}
              </button>
            </div>
          </>
        )}

        {myWallets.data && (
          <>
            <div className={styles.title}>{t('pending_earnings')}</div>
            <div className={styles.wallet}>
              <div>
                <span className={styles.val}>
                  {myWallets.data.wallets.revenue}
                </span>
                {' NUT '}
              </div>

              <div className={styles.tip}>
                <span>{t('earnings_tip')}</span>
              </div>
            </div>
          </>
        )}

        <div className={styles.icon}>
          <TbWallet size={'2.5em'} />
        </div>
      </div>
    </>
  )
}

export default Wallets
