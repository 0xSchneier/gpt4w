import {
  ChangeEventHandler,
  useRef,
  useState,
  CSSProperties,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import classnames from 'classnames'

import plane from '/assets/send.png'

interface Props {
  className?: string
  value: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  onSend?: () => void
  disabled?: boolean
}

const lineHei = 24
const maxLines = 3

export default function TextArea(props: Props) {
  const { className = '', disabled, value, onChange, onSend } = props
  const [boxStyle, setBoxStyle] = useState<CSSProperties>({
    height: 24,
    overflowY: 'hidden',
  })

  const textRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e)
  }

  const handleSend = useCallback(() => {
    if (value.length > 0) {
      onSend()
    }
  }, [onSend, value])

  const muted = useMemo(() => disabled || value.length === 0, [disabled, value])

  const compute = (hei: number) => {
    const lines = Math.ceil(hei / lineHei)
    const s: CSSProperties =
      lines >= maxLines
        ? {
            height: lineHei * maxLines,
            overflowY: 'auto',
          }
        : {
            height: lineHei * lines,
            overflowY: 'hidden',
          }
    setBoxStyle(s)
    // console.log('lines', lines, hei, lineHei)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!e.shiftKey && e.which === 13) {
        onSend()
        e.preventDefault()
      }
    },
    [onSend]
  )

  useEffect(() => {
    compute(lineHei)
    setTimeout(() => {
      const node = textRef.current
      if (node) {
        const scrollHei = node.scrollHeight
        compute(scrollHei)
      }
    }, 0)
  }, [value])

  return (
    <div
      className={`flex flex-col max-w-[720px] w-[90vw] flex-grow py-3 pl-4 border bg-white rounded-[10px] shadow-input ${className}`}
    >
      <img
        src={plane}
        alt=''
        onClick={handleSend}
        className={classnames([
          'absolute w-[22px] h-[22px] right-[20px] bottom-[12px]',
          { 'grayscale opacity-30': muted, 'cursor-pointer': !muted },
        ])}
      />
      <textarea
        onChange={handleChange}
        value={value}
        id='input'
        ref={textRef}
        onKeyDown={handleKeyDown}
        style={boxStyle}
        disabled={disabled}
        maxLength={2000}
        placeholder='Ask me anything...'
        className='m-0 text-[15px] w-full resize-none border-0 leading-[24px] outline-0 bg-transparent p-0 pr-[55px]'
        rows={3}
      ></textarea>
    </div>
  )
}
