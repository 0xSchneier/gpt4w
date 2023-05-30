import { useCallback, useState, useContext, forwardRef } from 'react'

import StatusText from '../../../components/Status'
import TypedText from './TypedText'
import PlainText from './PlainText'
import BlinkText from './BlinkText'
import ImageLogo from '/assets/icon.png'
import removePop from '../../../images/remove-pop@2x.png'

import { CurrentUserContext } from '../../../context/currentUser'

interface BotMessageCardProps {
  text: string
  noAnimation?: boolean
  onFinish?: () => void
  onStart?: () => void
  typingRef: any
  isError: boolean
}

export const BotMessageCard = function BotMessageCard(
  props: BotMessageCardProps
) {
  const {
    text,
    isError,
    noAnimation = false,
    onFinish,
    onStart,
    typingRef,
  } = props
  const [typing, setTyping] = useState(true)

  const finish = useCallback(() => {
    setTyping(false)
    onFinish?.()
  }, [onFinish])
  return (
    <li className='even:bg-box group/list'>
      <div className='flex justify-start items-center w-[800px] py-[34px] mx-auto'>
        {!isError && (
          <div className='profile flex-none w-[46px] h-[46px] mr-[40px] rounded-full overflow-hidden bg-[#ffffff]'>
            <img src={ImageLogo} alt='gptbot' />
          </div>
        )}
        {isError ? (
          <BotMessageErrorCard error={text} />
        ) : typing && !noAnimation ? (
          <TypedText
            text={text}
            onFinish={finish}
            onStart={onStart}
            ref={typingRef}
          />
        ) : (
          <PlainText text={text} />
        )}
      </div>
    </li>
  )
}

interface BotMessageErrorCardProps {
  error: string
}

export function BotMessageErrorCard(props: BotMessageErrorCardProps) {
  const { error } = props

  return (
    <div className='even:bg-box group/list'>
      <div className='flex justify-start items-center w-[800px] py-[34px] mx-auto'>
        <div className='profile flex-none w-[46px] h-[46px] mr-[40px] rounded-full overflow-hidden bg-[#ffffff]'>
          <img src={ImageLogo} alt='gptbot' />
        </div>
        <div className={`mr-[55px] flex-none w-fit`}>
          <StatusText type='error' message={error} />
        </div>
      </div>
    </div>
  )
}

export function BotMessageCardLoading() {
  return (
    <li className='even:bg-box group/list'>
      <div className='flex justify-start items-center w-[800px] py-[34px] mx-auto'>
        <div className='profile flex-none w-[46px] h-[46px] mr-[40px] rounded-full overflow-hidden bg-[#ffffff]'>
          <img src={ImageLogo} alt='gptbot' />
        </div>
        <BlinkText />
      </div>
    </li>
  )
}

export interface UserMessageProps {
  text: string
  id: string
  onRemoveMessage: () => void
}

export function UserMessageCard(props: UserMessageProps) {
  const { text, onRemoveMessage } = props
  const { currentUser } = useContext(CurrentUserContext)

  return (
    <li className='even:bg-box group/list'>
      <div className='flex justify-start items-center w-[800px] py-[34px] mx-auto'>
        <div className='profile flex-none w-[46px] h-[46px] mr-[40px] rounded-full bg-[#ffffff]'>
          <img
            className='w-[46px] h-[46px] rounded-full'
            src={currentUser.portrait}
            alt=''
          />
        </div>
        <PlainText text={text} />
        <div className='w-[62px] h-[55px] rounded-full flex-none cursor-pointer'>
          <img
            src={removePop}
            onClick={onRemoveMessage}
            className='w-[62px] h-[55px] rounded-full hidden group-hover/list:block'
            alt=''
          />
        </div>
      </div>
    </li>
  )
}
