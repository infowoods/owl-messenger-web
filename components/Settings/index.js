import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import styles from './index.module.scss'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const BottomSheet = dynamic(() => import('../../widgets/BottomSheet'))

import { useRouter } from 'next/router'

import { logout } from '../../utils/loginUtil'
import { ProfileContext } from '../../stores/useProfile'

import { getUserSettings, updateUserSettings } from '../../services/api/owl'

function Settings() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [, dispatch] = useContext(ProfileContext)
  const [userUtc, setUserUtc] = useState(null)
  const [tempUtc, setTempUtc] = useState(null)
  const [utcShow, setUtcShow] = useState(false)

  const handleUserSettings = async () => {
    try {
      const data = await getUserSettings()
      if (data) {
        data.settings.utc.toString() &&
          setUserUtc(data.settings.utc) &&
          setTempUtc(data.settings.utc)
      } else {
        toast.error(t('get_settings_error'))
      }
    } catch (error) {
      if (error?.data?.message === 'user data is empty') {
        setUserUtc('-')
      }
      if (error?.action === 'logout') {
        logout(dispatch)
        router.push('/')
      }
    }
  }

  const handleUpdateSettings = async () => {
    const params = { settings: { utc: tempUtc } }
    const data = await updateUserSettings(params)
    if (data?.user_id) {
      toast.success(t('setting_update'))
      setUserUtc(tempUtc)
    } else {
      toast.error(t('update_error'))
    }
  }

  useEffect(() => {
    handleUserSettings()
  }, [])

  return (
    <div className={styles.main}>
      <div>
        <p className={styles.title}># {t('settings')}</p>

        <div className={styles.card}>
          <p>
            <span>
              UTC {t('time')}
              {t('colon')}
            </span>
            <span>
              {t('current_utc')} - (<span>{userUtc}</span>)
            </span>
          </p>
          <button className={styles.button} onClick={() => setUtcShow(true)}>
            {t('change')}
          </button>
        </div>

        <BottomSheet
          t={t}
          show={utcShow}
          onClose={() => {
            setUtcShow(false)
            setTempUtc(userUtc)
          }}
          withConfirm={true}
          confirmTitle={t('select_utc')}
          onCancel={() => {
            setUtcShow(false)
            setTempUtc(userUtc)
          }}
          onConfirm={() => {
            setUtcShow(false)
            handleUpdateSettings()
          }}
        >
          <div className={styles.sheet}>
            <div>
              <div className={styles.itemsGroup}>
                {[...Array(24).keys()].map((item) => {
                  return (
                    <div
                      className={`${styles.item} ${
                        (tempUtc?.toString()
                          ? item - 11 === tempUtc
                          : item - 11 === userUtc) && styles.itemSelected
                      }`}
                      key={item}
                      onClick={() => setTempUtc(item - 11)}
                    >
                      <div>UTC</div>
                      <div>{item - 11}</div>
                      <div></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </BottomSheet>

        <div
          className={styles.logout}
          onClick={() => {
            logout(dispatch)
            router.push('/')
          }}
        >
          {t('logout')}
        </div>
      </div>

      <OwlToast />
    </div>
  )
}

export default Settings
