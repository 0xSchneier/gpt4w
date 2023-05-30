import {
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react'
import Typed from '@dioxide-js/typed.js'
import { v4 as uuidV4 } from 'uuid'

import { CodeSnippet } from './PlainText'

interface Props {
  text: string
  onFinish: () => void
  onStart?: () => void
}

function TypedText(props: Props, ref: any) {
  const { text, onFinish, onStart } = props
  const el = useRef(null)
  const typingRef = useRef<Typed>(null)

  const nodeId = useMemo(() => {
    return 'id-' + uuidV4()
  }, [])

  useImperativeHandle(ref, () => ({
    stop() {
      typingRef.current.stop(true)
    },
  }))

  useEffect(() => {
    const typed = (typingRef.current = new Typed(el.current, {
      // strings: [text],
      stringsElement: '#' + nodeId,
      typeSpeed: 10,
      showCursor: false,
      onComplete() {
        onFinish?.()
      },
    }))
    onStart?.()
    return () => {
      typed.destroy()
    }
  }, [])

  return (
    <div
      className={`mr-[55px] flex-none w-fit text-[14px]`}
      style={{ width: '-webkit-fill-available' }}
    >
      <div id={nodeId}>
        <CodeSnippet text={text} />
      </div>
      <span ref={el}></span>
    </div>
  )
}

export default forwardRef(TypedText)
