import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
const QRCode = require('qrcode.react')
import { Button } from '@nextui-org/react'
import toast from 'react-hot-toast'

import {
  listGoods,
  createOrder,
  checkOrder,
} from '../../../services/api/infowoods'

import Loading from '../../../widgets/Loading'
import BottomSheet from '../../../widgets/BottomSheet'
import BottomSelection from '../../../widgets/BottomSelection'

import styles from './index.module.scss'
import { APPS } from '../../../constants'

const STEP_NAMES = {
  SELECT_GOODS: 'SELECT_GOODS',
  SELECT_PAYMENTS: 'SELECT_PAYMENTS',
  PAY_BY_MIXIN_QRCODE: 'PAY_BY_MIXIN_QRCODE',
  PAY_BY_MIXIN: 'PAY_BY_MIXIN', // in Mixin Messenger
  PAY_BY_MIXPAY: 'PAY_BY_MIXPAY', // ExinOne MixPay.me
  CHECKING_ORDER: 'CHECKING_ORDER',
  IS_ERROR: 'IS_ERROR',
  FINISH_ALL: 'FINISH_ALL',
}

function useGoodsList(handleInfowoodsApiErrorP) {
  const { data, error } = useSWR('goods', listGoods)
  if (error) {
    handleInfowoodsApiErrorP(error)
  }

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function TopUpSheet(props) {
  const {
    ctx,
    t,
    curLogin,
    myWallets,
    handleInfowoodsApiErrorP,
    showTopupSheet,
    setShowTopupSheet,
  } = props

  const router = useRouter()

  const [stepName, setStepName] = useState(STEP_NAMES.SELECT_GOODS)
  const [payLinks, setPayLinks] = useState(null)
  const [orderTraceID, setOrderTraceID] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)
  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [theTimer, setTheTimer] = useState(null)
  const [paymentURI, setPaymentURI] = useState(null)
  const goodsList = useGoodsList(handleInfowoodsApiErrorP)
  const goodsOptions = []
  if (goodsList.data) {
    for (var item of goodsList.data) {
      goodsOptions.push({ label: item.name, value: item.id })
    }
  }

  function onClose() {
    clearInterval(theTimer)
    setOrderTraceID(null)
    setOrderStatus(null)
    setStepName(STEP_NAMES.SELECT_GOODS)
    setShowTopupSheet(false)
  }

  function autoCheckOrder() {
    var tryCount = 0
    const tmr = setInterval(async () => {
      if (!orderTraceID) {
        clearInterval(tmr)
        return
      }
      try {
        tryCount += 1
        let params = { app: APPS.current }
        if (stepName === STEP_NAMES.PAY_BY_MIXPAY) {
          params.mixpay_trace_id = orderTraceID
        } else {
          params.mm_trace_id = orderTraceID
        }

        const rsp = await checkOrder(params)
        if (!rsp || !rsp.status) {
          setOrderStatus(t('waiting_transfer'))
        } else if (rsp?.status === 'pending') {
          setOrderStatus(t('received_the_transfer'))
        } else if (rsp?.status === 'finished') {
          myWallets.refresh()
          const ok_msg = t('top_up_ok') + `+${rsp.goods?.coin_amount} NUT`
          setOrderStatus(ok_msg)
          clearInterval(tmr)
          setOrderTraceID(null)
          toast.success(ok_msg, { duration: 3000 })
          onClose()
        } else {
          setOrderStatus(t('checking'))
        }
      } catch (err) {
        if (tryCount > 9) {
          //timeout
          setStepName(STEP_NAMES.IS_ERROR)
          clearInterval(tmr)
          setOrderStatus(err.message)
          handleInfowoodsApiErrorP(err)
        }
      }
    }, 5000)
    setTheTimer(tmr)
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
    } else if (
      stepName === STEP_NAMES.CHECKING_ORDER ||
      stepName === STEP_NAMES.IS_ERROR
    ) {
      return t('checking_order')
    }
  }

  return (
    <BottomSheet onClose={onClose} showing={showTopupSheet}>
      <div className={styles.wrap}>
        <div className={styles.sheetTitle}>{getSheetTitle()}</div>

        {stepName === STEP_NAMES.SELECT_GOODS && goodsList.isLoading && (
          <Loading size={'md'} />
        )}
        {stepName === STEP_NAMES.SELECT_GOODS && goodsList.data && (
          <BottomSelection
            options={goodsOptions}
            onSelect={async (val) => {
              setStepName(STEP_NAMES.SELECT_PAYMENTS)
              setPayLinks(null)
              try {
                const d = await createOrder(APPS.current, val)
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
                      image: '/images/mixin-logo.png',
                    },
                    {
                      label: t('pay_by_mixpay'),
                      value: `${d.payment_links.mixpay}`,
                      image: '/images/mixpay-logo.png',
                    },
                  ]
                  setPayLinks(links)
                }
              } catch {
                setPayLinks(null)
                setStepName(STEP_NAMES.SELECT_GOODS)
                setShowTopupSheet(false)
                handleInfowoodsApiErrorP(error)
              }
            }}
          ></BottomSelection>
        )}

        {stepName === STEP_NAMES.SELECT_PAYMENTS && !payLinks && (
          <Loading size={'md'} />
        )}
        {stepName === STEP_NAMES.SELECT_PAYMENTS && payLinks && (
          // 在 MM 中将直接弹出MM支付对话框，不会进行到这里。
          // 普通浏览器中访问，才会到此步骤，选择多种支付方式，
          <BottomSelection
            options={payLinks}
            onSelect={(val) => {
              setPaymentURI(val)

              if (val.startsWith('mixin://')) {
                setStepName(STEP_NAMES.PAY_BY_MIXIN_QRCODE)
                setQrCodeValue(val)
              } else {
                // .startsWith("https://mixpay.me/")
                setStepName(STEP_NAMES.PAY_BY_MIXPAY)
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
          <div className={styles.tip}>{t('tip_of_pay_by_mixin')}</div>
        )}
        {stepName === STEP_NAMES.PAY_BY_MIXPAY && (
          <div className={styles.tip}>{t('tip_of_pay_by_mixpay')}</div>
        )}

        {stepName === STEP_NAMES.CHECKING_ORDER && (
          <div className={styles.tip}>
            <Loading size={'sm'} />
            <span>{orderStatus}</span>
          </div>
        )}

        {stepName === STEP_NAMES.IS_ERROR && (
          <div className={styles.notice}>
            <span>{orderStatus}</span>
          </div>
        )}

        {/* confirm button */}
        {stepName === STEP_NAMES.PAY_BY_MIXIN_QRCODE ||
        stepName === STEP_NAMES.PAY_BY_MIXIN ||
        stepName === STEP_NAMES.PAY_BY_MIXPAY ? (
          <div className={styles.buttons}>
            <Button
              type="button"
              onPress={() => {
                // user confirm transferred
                setStepName(STEP_NAMES.CHECKING_ORDER)
                setOrderStatus(t('waiting_transfer'))
                autoCheckOrder() //start order checker
              }}
              auto
              rounded
              // bordered
              size="md"
            >
              {t('paid')}
            </Button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </BottomSheet>
  )
}

export default TopUpSheet
