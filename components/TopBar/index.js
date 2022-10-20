import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { RiArrowLeftLine, RiArrowDownSLine } from 'react-icons/ri'

import { toLogin, saveGroupData } from '../../utils/loginUtil'
import { checkGroup } from '../../services/api/infowoods'
import Avatar from '../../widgets/Avatar'
import { APPS } from '../../constants'
import favIconImg from '../../public/favicon.png'

import styles from './index.module.scss'

function TopBar(props) {
  const { ctx, t, curLogin, backPath, showApps, setShowApps } = props
  const router = useRouter()

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
      if (ctx.conversation_id) {
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
          })
      }
    }
  }, [ctx, curLogin])

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        {curLogin?.group?.is_group}
        {backPath && (
          <RiArrowLeftLine
            className={styles.back}
            onClick={() => {
              router.push(backPath)
            }}
          />
        )}

        {!backPath && curLogin?.user && (
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
        )}
        {!backPath && !curLogin?.user && (
          <span className={styles.login} onClick={() => toLogin()}>
            {curLogin?.group?.is_group ? t('group_login') : t('login')}
          </span>
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
  )
}

export default TopBar
