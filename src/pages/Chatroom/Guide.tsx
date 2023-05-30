import { useMemo, useCallback, useState, useContext } from 'react'
// import detectEthereumProvider from '@metamask/detect-provider'

import LinkIcon from '/assets/arrow.png'
import logo from '../../images/logo.png'
import TextArea from '../../components/TextArea'
import { ConversationDoc } from '../../model/conversation'
import Setting from './components/Setting'

interface Props {
  onSubmit: (conversation: ConversationDoc) => void
  loading: boolean
}

export default function Guide(props: Props) {
  const { onSubmit, loading } = props
  const [val, setVal] = useState('')

  const onPick = useCallback((text: string) => {
    setVal(text)
  }, [])

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.currentTarget.value)
  }, [])

  const handleSend = useCallback(async () => {
    if (!val) return
    const user = await window.electron.getCurrentUser()
    const doc = await window.electron.createConversation(val, user.address)
    onSubmit(doc)
  }, [onSubmit, val])

  const items = useMemo(() => {
    return [
      'Explain quantum computing in simple terms',
      'Got any creative ideas for a 10-year-old`s birthday?',
      'How do I make an HTTP request in Javascript?',
    ]
  }, [])

  return (
    <div className='flex items-center justify-center w-full h-full font-semibold'>
      <div>
        <h1 className='font-extrabold mb-[20px] text-primary text-[30px] flex justify-center'>
          <img src={logo} className='w-[144px]' />
        </h1>
        <h2 className='text-secondary text-[17px] mb-[40px] text-center'>
          <span className='h-[1px] inline-block w-[52px] bg-line align-middle mr-[30px] '></span>
          <span className='inline-block bg-white'>
            Chat freely and Privately
          </span>
          <span className='h-[1px] inline-block w-[52px] bg-line align-middle ml-[30px]'></span>
        </h2>
        <h4 className='mb-[13px]'>How can I start?</h4>
        <ul className='text-[14px]'>
          {items.map((item) => (
            <li
              key={item}
              onClick={() => onPick(item)}
              className='bg-box px-[20px] py-[20px] pl-[35px] w-[500px] rounded-[7px] mb-[15px] flex justify-between items-center cursor-pointer border-[1px] border-[#F5F5F5] hover:border-[#2765FF]'
            >
              <p>"{item}"</p>
              <img src={LinkIcon} className='w-[20px] h-[20px]' alt='' />
            </li>
          ))}
        </ul>
      </div>
      <div className='fixed bottom-[45px] flex items-center'>
        <TextArea
          className='relative flex'
          onChange={onChange}
          value={val}
          disabled={loading}
          onSend={handleSend}
        />
        {/* <Setting /> */}
      </div>
    </div>
  )
}
