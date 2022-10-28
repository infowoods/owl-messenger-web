import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { RiArrowLeftLine, RiArrowDownSLine } from 'react-icons/ri'

import { toLogin, saveGroupData } from '../../utils/loginUtil'
import { checkGroup } from '../../services/api/infowoods'
import Avatar from '../../widgets/Avatar'
import { APPS } from '../../constants'
import favIconImg from '../../public/favicon.png'

const Loading = dynamic(() => import('../../widgets/Loading'))
import { handleInfowoodsApiError } from '../../utils/apiUtils'

import styles from './index.module.scss'

function TopBar(props) {
  const { ctx, t, curLogin, backPath, showApps, setShowApps } = props
  const router = useRouter()
  const [isCheckingGroup, setIsCheckingGroup] = useState(false)

  const avatarLink = (path) => {
    switch (path) {
      case '/user':
        break
      default:
        return '/user'
    }
  }

  useEffect(() => {
    if (ctx) {
      if (ctx.conversation_id && !curLogin?.token && !curLogin?.group) {
        setIsCheckingGroup(true)
        checkGroup({
          app: APPS.current,
          conversation_id: ctx.conversation_id,
        })
          .then((data) => {
            saveGroupData(ctx.conversation_id, data)
            curLogin.group = data
          })
          .catch((error) => {
            toast.error(error.message)
            handleInfowoodsApiError(error, t, curLogin)
          })
          .finally(() => {
            setIsCheckingGroup(false)
          })
      }
    }
  }, [ctx, t, curLogin])

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.left}>
          {backPath && (
            <RiArrowLeftLine
              className={styles.back}
              onClick={() => {
                router.push(backPath)
              }}
            />
          )}

          {!backPath && isCheckingGroup && <Loading size={'sm'} />}
          {!backPath && !isCheckingGroup && (
            <>
              {curLogin?.user ? (
                <div className={styles.avatar}>
                  <Avatar
                    isGroup={curLogin?.group?.is_group}
                    imgSrc={curLogin?.user?.avatar}
                    onClick={() => {
                      const link = avatarLink(router.pathname)
                      if (link) {
                        router.push(link)
                      }
                    }}
                  />
                </div>
              ) : (
                <span className={styles.login} onClick={() => toLogin()}>
                  {curLogin?.group?.is_group ? t('group_login') : t('login')}
                </span>
              )}
            </>
          )}
        </div>

        <div className={styles.middle}>
          <div
            className={styles.app}
            onClick={() => {
              setShowApps(true)
            }}
          >
            <Image src={favIconImg} alt="favicon" width={24} height={24} />
            <span className={styles.title}>{t(APPS[APPS.current].title)}</span>
            <span className={showApps ? styles.active : styles.passive}>
              <RiArrowDownSLine className={styles.arrow} />
            </span>
          </div>
        </div>
        <div className={styles.right}></div>
      </div>
    </>
  )
}

export default TopBar
