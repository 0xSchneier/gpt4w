import { useContext, useEffect, useRef, useState } from 'react';
import { CurrentUserContext } from '../../context/currentUser';
import EmptyModel from './Empty';
import bg from '/assets/bg.png'
import { toShortAddr } from '../../utils/string'

interface DialogProps {
  handleCancel: () => void
  handleConfirm: () => void
}

const PointDialog = (props: DialogProps) => {
  const { handleCancel, handleConfirm } = props
  const [ balance, setBalance ] = useState(0)
  const [ showError, setShowError ] = useState(false)
  const modelRef = useRef<EmptyModel>()
  const { currentUser } = useContext(CurrentUserContext)

  useEffect(() => {
    getBalance()
  }, [])

  const getBalance = async () => {
    try {
      // todo
      const balance = 0
      setBalance(balance)
      setShowError(true)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <EmptyModel ref={modelRef}>
      <div className='px-[30px] py-[22px] w-[500px] bg-white rounded-[12px]'>
        <p className='mb-[30px] font-extrabold text-[18px] font-regular text-left flex items-center justify-between'>
          Point
          <span className='close-icon' onClick={handleCancel}></span>
        </p>
        <div className='relative bg-cover w-full h-[260px] rounded-[16px] text-[#ffffff]' style={{ backgroundImage: `url(${bg})` }}>
          <span className='absolute top-[26px] right-[16px]'>{toShortAddr(currentUser.address)}</span>
          <span className='absolute bottom-[26px] left-[16px] text-[26px]'>{balance}</span>
        </div>
        {showError && <p className='text-[14px] mt-[8px] text-right text-[#C93A39]'>You don't have enough Points, please go to Top Up.</p>}
        <button className='btn mt-[30px]' onClick={handleConfirm}>
          Top UP
        </button>
      </div>
    </EmptyModel>
  )
}

export default PointDialog