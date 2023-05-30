import { useCallback, useState, useEffect } from 'react'
import iconSrc from './icon.png'
import { Link } from 'react-router-dom'

import styles from './style.module.scss'

console.log(styles)

const NOTIFICATION_TITLE = 'Title'
const NOTIFICATION_BODY =
  'Notification from the Renderer process. Click to log to console.'
const CLICK_MESSAGE = 'Notification clicked!'

export default function Workbench() {
  const [source, setSource] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const [value, setValue] = useState('')
  useEffect(() => {
    window.electron.onIPCValue((e: string, v: string) => {
      console.log('get ipcrender value', e, v)
      setValue(v)
    })
    window.electron.onIPCMessage((e: string, v: string) => {
      console.log('get ipcrender value', e, v)
      setMessage(v)
    })
  }, [])

  const handleToggle = useCallback(async () => {
    const isDarkMode = await window.electron.toggle()
    setSource(isDarkMode ? 'Dark' : 'Light')
  }, [])

  const handleReset = useCallback(async () => {
    await window.electron.system()
    setSource('System')
  }, [])

  const notice = useCallback(() => {
    new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
      () => setOutput(CLICK_MESSAGE)
  }, [])

  return (
    <div className='font-inter-regular'>
      <h1 className={styles.title}>Hello World!</h1>
      <p className='text-[25px] mt-10'>Welcome to your Electron application.</p>
      <img src={iconSrc} alt='' />
      <p>
        Current theme source: <strong id='theme-source'>{source}</strong>
      </p>
      <p>chatgpt message: {message}</p>
      <p>IPC Value From Child Process: {value}</p>
      <p>{output}</p>
      <button id='toggle-dark-mode' onClick={handleToggle}>
        Toggle Dark Mode
      </button>
      <button id='reset-to-system' onClick={handleReset}>
        Reset to System Theme
      </button>
      <button id='reset-to-system' onClick={notice}>
        show Notifiction
      </button>
      <br />
      <br />
      <br />
      <div>
        <Link to='/about'>Go To About</Link>
      </div>
    </div>
  )
}
