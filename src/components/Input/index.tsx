import { KeyboardEvent, useCallback, useMemo, useState } from 'react'
import clss from 'classnames'
import success from '/assets/success.png'

export interface Props {
  mode?: 'normal' | 'search'
  placeholder?: string
  className?: string
  error?: string
  value?: string
  type?: string
  showSuccess?: boolean
  onEnter?: (result: string) => void
  onChange?: (val: string) => void
  onBlur?: (val: string) => void
  onFocus?: (val: string) => void
}
const Input = (props: Props) => {
  const { onEnter, onBlur, onFocus, showSuccess, value, className, mode = 'normal', placeholder, onChange, error, type = 'text' } = props
  const [ active, setActive ] = useState(false)

  const onkeyup = useCallback(
    (event: KeyboardEvent) => {
      if (event.which === 13) {
        const value = (event.target as HTMLInputElement).value
        onEnter && onEnter(value)
      }
    },
    [onEnter, mode],
  )

    const handleBlur = useCallback((val: string) => {
      setActive(false)
      onBlur && onBlur(val)
    }, [onBlur])

    const handleFocus = useCallback((val: string) => {
      setActive(true)
      onFocus && onFocus(val)
    }, [onFocus])

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        className={clss(
          'mb-[30px] h-[50px] text-[15px] py-2 border rounded-[10px] bg-transparent outline-none text-desc placeholder:text-[#cccccc] pl-[15px] focus:border-[#5391F7]',
          className,
          { '!border-[#CF3E41]': error },
        )}
        onKeyUp={onkeyup}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFocus(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
      {!active && !error && value && showSuccess && <img className='absolute w-[16px] h-[16px] top-[17px] right-[12px]' src={success} alt="success" />}
      {error && <p className=" text-[14px] text-[#CF3E41] absolute bottom-[4px] right-0">{error}</p>}
    </div>
  )
}

export default Input
