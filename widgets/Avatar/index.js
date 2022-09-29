import Image from 'next/image'

function Avatar(props) {
  const { isGroup = false, imgSrc, ...others } = props
  const defalutAvatar = '/default-avatar.png'

  return (
    <Image
      src={isGroup ? defalutAvatar : imgSrc ? imgSrc : defalutAvatar}
      alt="avatar"
      width={38}
      height={38}
      {...others}
    />
  )
}

export default Avatar
