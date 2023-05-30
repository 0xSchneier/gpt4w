import { useCallback, useRef } from 'react'
import EmptyModel from './Empty'
import clss from 'classnames'

interface Props {
  title: string
  titleClassName?: string
  cancelText?: string
  okText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModel(props: Props) {
  const {
    title,
    titleClassName = '',
    cancelText = 'Cancel',
    okText = 'Clear',
    onConfirm,
    onCancel,
  } = props

  const modelRef = useRef<EmptyModel>()

  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  return (
    <EmptyModel ref={modelRef}>
      <div className='px-[30px] py-[44px] w-[540px] bg-white rounded-[12px]'>
        <p className={clss(titleClassName, 'mb-[30px] text-[18px] font-regular text-center')}>
          {title || 'Title'}
        </p>
        <div className='flex justify-center items-center'>
          <a
            className='min-w-[100px] h-[48px] flex rounded-[12px] justify-center items-center bg-white border text-base border-base cursor-pointer'
            onClick={handleCancel}
          >
            {cancelText}
          </a>
          <a
            className='min-w-[100px] h-[48px] flex rounded-[12px] justify-center items-center bg-danger ml-[40px] cursor-pointer text-white'
            onClick={onConfirm}
          >
            {okText}
          </a>
        </div>
      </div>
    </EmptyModel>
  )
}
