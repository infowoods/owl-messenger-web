import Image from 'next/image'

function Avatar(props) {
  const { isGroup = false, imgSrc, ...others } = props
  const defaultAvatar = '/images/default-avatar.png'

  return (
    <Image
      src={isGroup ? defaultAvatar : imgSrc ? imgSrc : defaultAvatar}
      alt="avatar"
      width={28}
      height={28}
      {...others}
    />
  )
}

export default Avatar
