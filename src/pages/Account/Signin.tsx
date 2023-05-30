import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConversationDoc } from '../../model/conversation'
import Input from '../../components/Input'
import logo from '../../images/logo.png'

const PAW_ERROR = 'Passcode do not match'
const Signin = () => {
  const [paw, setPaw] = useState('')
  const [pawError, setPawError] = useState('')
  const navigate = useNavigate()

  const handleUnlock = useCallback(async () => {
    const result = await window.electron.validatePwd(paw)
    if (result) {
      window.electron.getCurrentUser().then((user) => {
        window.electron.getConversationById(user.address).then((r: ConversationDoc) => {
          console.log('navigate to /chatroom', r)
          navigate('/chatroom', { state: { conversation: r ? r.uid : '' } })
        })
      })
    } else {
      setPawError(PAW_ERROR)
    }
  }, [paw])

  return (
    <div className='flex flex-col items-center justify-center w-full h-full font-semibold'>
      <h1 className='font-extrabold mb-[20px] text-primary text-[30px] flex justify-center'>
        <img src={logo} className='w-[144px]' />
      </h1>
      <p className='mt-[16px] mb-[26px] flex items-center  text-[20px] font-bold text-[gray]'>
        <span className='inline-block w-[100px] h-[1px] bg-[lightgray]'></span>
        <span className='mx-[20px]'>Chat Freely And Privately</span>
        <span className='inline-block w-[100px] h-[1px] bg-[lightgray]'></span>
      </p>
      <Input
        type='password'
        showSuccess={true}
        className='w-[400px] mb-0'
        placeholder='Enter Passcode'
        value={paw}
        error={pawError}
        onChange={setPaw}
        onEnter={handleUnlock}
      />
      <button onClick={handleUnlock} className='btn !w-[400px] mt-[26px]'>
        Login
      </button>
    </div>
  )
}

export default Signin