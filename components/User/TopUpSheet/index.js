import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { listGoods, createOrder } from '../../../services/api/owl'
import BottomSelection from '../../../widgets/BottomSelection'
import { getMixinContext } from '../../../utils/pageUtil'
const QRCode = require('qrcode.react')

import { checkOrder } from '../../../services/api/owl'
import Loading from '../../../widgets/Loading'
import styles from './index.module.scss'

const STEP_NAMES = {
  SELECT_GOODS: 'SELECT_GOODS',
  SELECT_PAYMENTS: 'SELECT_PAYMENTS',
  PAY_BY_MIXIN_QRCODE: 'PAY_BY_MIXIN_QRCODE',
  PAY_BY_MIXIN: 'PAY_BY_MIXIN', // in Mixin Messenger
  PAY_BY_MIXPAY: 'PAY_BY_MIXPAY', // ExinOne MixPay.me
  CHECKING_ORDER: 'CHECKING_ORDER',
  FINISH_ALL: 'FINISH_ALL',
}

function useGoodsList(handelOwlApiErrorP) {
  const { data, error } = useSWR('goods', listGoods)
  if (error) {
    handelOwlApiErrorP(error)
  }

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function TopUpSheet(props) {
  const { t, toast, myWallets, handelOwlApiErrorP, setInProcessOfTopUp } = props
  const ctx = getMixinContext()
  const router = useRouter()

  const [stepName, setStepName] = useState(STEP_NAMES.SELECT_GOODS)
  const [payLinks, setPayLinks] = useState(null)
  const [orderTraceID, setOrderTraceID] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [paymentURI, setPaymentURI] = useState(null)
  const goodsList = useGoodsList(handelOwlApiErrorP)
  const goodsOptions = []
  if (goodsList.data) {
    for (var item of goodsList.data) {
      goodsOptions.push({ label: item.name, value: item.id })
    }
  }

  function onClose() {
    setStepName(STEP_NAMES.SELECT_GOODS)
    setOrderTraceID(null)
    setOrderStatus('')
    setInProcessOfTopUp(false)
  }
  function onCancel() {
    setInProcessOfTopUp(false)
    setStepName(STEP_NAMES.SELECT_GOODS)
    setOrderTraceID(null)
    setOrderStatus('')
  }

  function autoCheckOrder() {
    const theTimer = setInterval(async () => {
      console.log('check order timer tick-tock')
      if (!orderTraceID) {
        clearInterval(theTimer)
        return
      }
      try {
        let params = {}
        if (paymentMethod === 'mixpay') {
          params = { mixmpay_trace_id: orderTraceID }
        } else {
          params = { mm_trace_id: orderTraceID }
        }
        const rsp = await checkOrder(params)
        if (!rsp || !rsp.status) {
          setOrderStatus(t('waiting_transfer'))
        } else if (rsp?.status === 'pending') {
          setOrderStatus(t('received_the_transfer'))
        } else if (rsp?.status === 'finished') {
          console.log('rsp of order :>> ', rsp)
          myWallets.refresh()
          const ok_msg = t('top_up_ok') + `+${rsp.goods?.coin_amount} NUT`
          setOrderStatus(ok_msg)
          clearInterval(theTimer)
          setOrderTraceID(null)
          toast.success(ok_msg)
          onClose()
        } else {
          setOrderStatus(t('checking'))
        }
      } catch (err) {
        clearInterval(theTimer)
        setOrderStatus(err.message)
        handelOwlApiErrorP(err)
      }
    }, 3000)
    return theTimer
  }

  function getSheetTitle() {
    if (stepName === STEP_NAMES.SELECT_GOODS)
      if (goodsList.data) {
        return t('select_nut_quantity')
      } else {
        return t('load_top_up_options')
      }
    else if (stepName === STEP_NAMES.SELECT_PAYMENTS) {
      if (payLinks) {
        return t('select_payment_methods')
      } else {
        return t('create_order')
      }
    } else if (
      stepName === STEP_NAMES.PAY_BY_MIXIN_QRCODE ||
      stepName === STEP_NAMES.PAY_BY_MIXIN
    ) {
      return t('pay_by_mixin')
    } else if (stepName === STEP_NAMES.PAY_BY_MIXPAY) {
      return t('pay_by_mixpay')
    } else if (stepName === STEP_NAMES.CHECKING_ORDER) {
      return t('checking_order')
    }
  }

  return (
    <div className={`${styles.overlay}`} onClick={() => onClose()}>
      <div className={styles.mask}></div>
      <div
        className={styles.sheet}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className={styles.title}>
          <div>
            <span onClick={() => onCancel()}>{t('cancel')}</span>
          </div>
          {/* middle title */}
          <div>{getSheetTitle()}</div>

          {/* right blank/confirm button */}
          {stepName === STEP_NAMES.PAY_BY_MIXIN_QRCODE ||
          stepName === STEP_NAMES.PAY_BY_MIXIN ||
          stepName === STEP_NAMES.PAY_BY_MIXPAY ? (
            <div>
              <span
                onClick={() => {
                  // user confirm transferred
                  setStepName(STEP_NAMES.CHECKING_ORDER)
                  setOrderStatus(t('waiting_transfer'))
                  autoCheckOrder() //start order checker
                }}
              >
                {t('paid')}
              </span>
            </div>
          ) : (
            <div>{/* right blank */}</div>
          )}
        </div>

        {/* bottom options - start */}

        {stepName === STEP_NAMES.SELECT_GOODS && goodsList.isLoading && (
          <Loading size={40} className={styles.loading} />
        )}
        {stepName === STEP_NAMES.SELECT_GOODS && goodsList.data && (
          <BottomSelection
            options={goodsOptions}
            onSelect={async (val) => {
              setStepName(STEP_NAMES.SELECT_PAYMENTS)
              setPayLinks(null)
              try {
                const d = await createOrder(val)
                if (ctx.app_version) {
                  // in mixin messenger app,
                  setPayLinks(null)
                  setOrderTraceID(d.trace_id)
                  setStepName(STEP_NAMES.PAY_BY_MIXIN)
                  await router.push(d.payment_links.mm) //open payment window directly
                } else {
                  setOrderTraceID(d.trace_id)
                  const links = [
                    {
                      label: t('pay_by_mixin'),
                      value: d.payment_links.mm,
                      image: '/mixin-logo.png',
                    },
                    {
                      label: t('pay_by_mixpay'),
                      value: `${d.payment_links.mixpay}`,
                      // &returnTo=https://${window.location.host}/order/check?mixpay_trace_id=${d.trace_id}
                      image: '/mixpay-logo.png',
                    },
                  ]
                  setPayLinks(links)
                }
              } catch {
                setPayLinks(null)
                setStepName(STEP_NAMES.SELECT_GOODS)
                setInProcessOfTopUp(false)
                handelOwlApiErrorP(error)
              }
            }}
          ></BottomSelection>
        )}

        {stepName === STEP_NAMES.SELECT_PAYMENTS && !payLinks && (
          <Loading size={40} className={styles.loading} />
        )}
        {stepName === STEP_NAMES.SELECT_PAYMENTS && payLinks && (
          // 在 MM 中将直接弹出MM支付对话框，不会进行到这里。
          // 普通浏览器中访问，才会到此步骤，选择多种支付方式，
          <BottomSelection
            options={payLinks}
            onSelect={async (val) => {
              if (val.startsWith('mixin://')) {
                setStepName(STEP_NAMES.PAY_BY_MIXIN_QRCODE)
                setQrCodeValue(val)
              } else {
                // .startsWith("https://mixpay.me/")
                setStepName(STEP_NAMES.PAY_BY_MIXPAY)
                setPaymentURI(val)
                window.open(val, '_blank')
              }
            }}
          ></BottomSelection>
        )}

        {stepName === STEP_NAMES.PAY_BY_MIXIN_QRCODE && qrCodeValue && (
          <div className={styles.qrcode}>
            <QRCode
              value={qrCodeValue}
              size={240}
              imageSettings={{
                src: '/mixin-logo.png',
                width: 50,
                height: 50,
              }}
            />
            <div className={styles.tip}>{t('mixin_payment_tip_qrcode')}</div>
          </div>
        )}

        {stepName === STEP_NAMES.PAY_BY_MIXIN && (
          <div className={styles.notice}>{t('tip_of_pay_by_mixin')}</div>
        )}
        {stepName === STEP_NAMES.PAY_BY_MIXPAY && (
          <div className={styles.notice}>{t('tip_of_pay_by_mixpay')}</div>
        )}

        {stepName === STEP_NAMES.CHECKING_ORDER && (
          <div className={styles.notice}>{orderStatus}</div>
        )}

        {/* bottom options - end */}
      </div>
    </div>
  )
}

export default TopUpSheet
