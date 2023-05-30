import credits from '/assets/credits.png'
import clear from '/assets/clear.png'
import remove from '/assets/remove.png'
import version from '/assets/version.png'
import lock from '/assets/lock.png'
import setting from '/assets/setting.png'
import ConfirmModel from '../../../components/Model'
import PointModel from '../../../components/Model/Point'
import Tooltip from '../../../components/Tooltip'
import { useState, useRef } from 'react'
import clss from 'classnames'
import { useNavigate } from 'react-router-dom'

interface SettingProps {
  conversationId?: string,
  onClear?: () => void
  className?: string
}

const Setting = (props: SettingProps) => {
  const { conversationId, onClear, className } = props
  const [showClearConfirm, setClearConfirmShow] = useState(false)
  const [showRemoveConfirm, setRemoveConfirmShow] = useState(false)
  const settingRef = useRef(null)
  const navigate = useNavigate()

  const warpSettingClick = (fn: () => void) => () => {
    settingRef.current && settingRef.current.click()
    return fn && fn()
  }

  // Show clear confirm
  const handleClearConv = warpSettingClick(() =>{
    setClearConfirmShow(true)
  })

  // Show remove confirm
  const handleRemoveConv = warpSettingClick(() =>{
    setRemoveConfirmShow(true)
  })

  // Lock
  const hanldeLock = warpSettingClick(async () => {
    await window.electron.lock()
    navigate('/signin')
  })

  // Confirm to remove all messages of conversation
  const handleConfirmClear = async () => {
    console.log('do remove conversation')
    const count = await window.electron.removeConversation(conversationId)
    const total = await window.electron.message.removeConversationMessages(
      conversationId
    )
    console.log('remove conversation ', count, 'messages: ', total)
    setClearConfirmShow(false)
    onClear && onClear()
  }

  // Confirm to remove account
  const handleConfirmRemove = async () => {
    const result = await window.electron.reset()
    if (result) {
      setRemoveConfirmShow(false)
      navigate('/signup')
      handleConfirmClear()
    }
  }

  return (
    <>
      {showClearConfirm && (
        <ConfirmModel
          title='Are you sure to clear all chat history?'
          onConfirm={handleConfirmClear}
          onCancel={() => setClearConfirmShow(false)}
        />
      )}
      {/* {showRemoveConfirm && (
        <ConfirmModel
          title='Once the account information is deleted, it can only be restored using the mnemonic phrase. Please ensure that the mnemonic phrase of the current account is properly kept!'
          okText='Remove'
          titleClassName='!text-left'
          onConfirm={handleConfirmRemove}
          onCancel={() => setRemoveConfirmShow(false)}
        />
      )}
      <Tooltip overlayClassName='setting-tooltip' trigger='click' placement="top" overlay={
        <div className="setting-group">
          {conversationId && <div className="setting-item" onClick={handleClearConv}>
            <img src={clear} alt="clear" />
            <span>Clear all chat history</span>
          </div>}
          <div className="setting-item" onClick={handleRemoveConv}>
            <img src={remove} alt="remove" />
            <span>Remove Account</span>
          </div>
          <div className="setting-item" onClick={hanldeLock}>
            <img src={lock} alt="lock" />
            <span>Lock</span>
          </div>
        </div>
        }>
        <img
          ref={settingRef}
          src={setting}
          className={clss('shadow-input ml-[24px] w-[45px] h-[45px] cursor-pointer border-[1px] border-slate-100 p-[8px] rounded-md bg-[#ffffff]', className)}
        />
      </Tooltip> */}
      <img
        src={clear}
        onClick={handleClearConv}
        className={clss('shadow-input ml-[24px] w-[45px] h-[45px] cursor-pointer border-[1px] border-slate-100 p-[8px] rounded-md bg-[#ffffff]', className)}
        />
    </>
  )
}

export default Setting