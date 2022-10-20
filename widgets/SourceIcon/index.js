import { RiFileCopyLine, RiMoneyDollarCircleLine } from 'react-icons/ri'
import { AiOutlineTwitter, AiOutlineWeibo } from 'react-icons/ai'
import { TbCircleDotted } from 'react-icons/tb'
import { FaTree } from 'react-icons/fa'
function SourceIcon({ uri, name }) {
  function getIcon({ uri, name }) {
    if (uri?.startsWith('och://twitter/') || name === 'twitter') {
      return <AiOutlineTwitter />
    } else if (uri?.startsWith('och://weibo/') || name === 'weibo') {
      return <AiOutlineWeibo />
    } else if (uri?.startsWith('och://channel/') || name === 'channel') {
      return <FaTree />
    } else if (uri?.startsWith('http')) {
      return <TbCircleDotted />
    } else {
      return <TbCircleDotted />
    }

    return <></>
  }
  return <>{getIcon({ uri, name })}</>
}
export default SourceIcon
