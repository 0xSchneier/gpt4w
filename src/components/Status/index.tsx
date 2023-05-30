import {} from 'react'

import RefreshUrl from '/assets/refresh.png'

interface Props {
  type?: 'error' | 'success' | 'progress'
  onClick?: () => void
  message: string
}

export default function Status(props: Props) {
  const { type = 'success', message = '', onClick } = props
  switch (type) {
    case 'success':
      return (
        <div
          onClick={onClick}
          className='px-[14px] cursor-pointer border border-green pt-[12px] pb-[11px] flex justify-center items-center bg-green text-green rounded-[7px]'
        >
          <span className='w-[14px] h-[14px] mr-[14px] block bg-deep-green'></span>
          <p className='text-[12px]'>{message}</p>
        </div>
      )
    case 'progress':
      return (
        <div
          onClick={onClick}
          className='px-[14px] cursor-pointer border border-blue pt-[12px] pb-[11px] flex justify-center items-center bg-blue text-blue rounded-[7px]'
        >
          <img src={RefreshUrl} className='mr-[8px] w-[20px] h-[20px]' />
          <p className='text-[12px]'>{message}</p>
        </div>
      )
    case 'error':
      return (
        <div
          onClick={onClick}
          className='px-[14px] border border-red pt-[12px] pb-[11px] flex justify-center items-center bg-red text-red rounded-[7px]'
        >
          <p className='text-[12px]'>{message}</p>
        </div>
      )
  }
  return null
}
