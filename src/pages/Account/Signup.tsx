import { useState, useMemo, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CurrentUserContext } from '../../context/currentUser'
import Input from '../../components/Input'
import logo from '../../images/logo.png'

const PAW_ERROR = 'Passcord length min. 8 - 20 characters'
const CONFIRM_PAW_ERROR = 'The two passcode do not match'
const Signup = () => {
  const [paw, setPaw] = useState('')
  const [confirmpaw, setConfimpaw] = useState('')
  const [pawError, setPawError] = useState('')
  const [confirmError, setConfimError] = useState('')
  const { setAddress } = useContext(CurrentUserContext)
  const navigate = useNavigate()

  const disableNext = useMemo(() => {
    return paw && confirmpaw && !pawError && !confirmError
  }, [paw, confirmpaw, pawError, confirmError])

  const handleBlurPaw = useCallback((val: string) => {
    if (paw && (paw.length < 8 || paw.length > 20)) {
      setPawError(PAW_ERROR)
    } else {
      setPawError('')
    }
  }, [paw])

  const handleBlurConfimpaw = useCallback((val: string) => {
    if (confirmpaw && paw !== confirmpaw) {
      setConfimError(CONFIRM_PAW_ERROR)
    } else {
      setConfimError('')
    }
  }, [paw, confirmpaw])

  const handleCreatAccount = useCallback(async () => {
    const address = await window.electron.generateUser(paw)
    if (address) {
      setAddress(address)
      navigate('/chatroom', { state: { conversation: '' } })
    }
  }, [paw])

  return (
    <div className='flex flex-col items-center justify-center w-full h-full font-semibold'>
      <h1 className='font-extrabold mb-[20px] text-primary text-[30px] flex justify-center'>
        <img src={logo} className='w-[144px]' />
      </h1>
      <p className='mt-[16px] text-[20px] font-bold'>Create Account</p>
      <p className='mt-[12px] text-[14px] mb-[26px] text-[gray]'>Set Passcode for GPT4W</p>
      <Input
        type='password'
        showSuccess={true}
        className='w-[400px]'
        placeholder='New Passcode (8 - 20 characters)'
        value={paw}
        error={pawError}
        onChange={setPaw}
        onBlur={handleBlurPaw}
      />
      <Input
        type='password'
        showSuccess={true}
        className='w-[400px]'
        placeholder='Confirm Passcode'
        value={confirmpaw}
        error={confirmError}
        onChange={setConfimpaw}
        onBlur={handleBlurConfimpaw}
      />
      <button onClick={handleCreatAccount} disabled={!disableNext} className='btn !w-[400px]'>
        Next
      </button>
    </div>
  )
}

export default Signup