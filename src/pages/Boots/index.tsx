import { useCallback, useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import logoImage from '/assets/boot.png'
import type { BackgroundModule } from '../../constants'
import type { ConversationDoc } from '../../model/conversation'
import { CurrentUserContext } from '../../context/currentUser'
// import { createPortrait } from '../../main/utils'
import IdentIcon from 'identicon.js'
import md5 from 'md5'

export default function Boots() {
  const navigate = useNavigate()
  const [moduleState, setModuleState] = useState<BackgroundModule>()
  const { setAddress } = useContext(CurrentUserContext)

  const getConversation = useCallback((up4w: BackgroundModule['up4w']) => {
    window.electron.getCurrentUser().then((user) => {
      window.electron
        .getConversationById(user.address)
        .then((r: ConversationDoc) => {
          console.log('navigate to /chatroom', r)
          navigate('/chatroom', {
            state: { conversation: r ? r.uid : '', up4w },
          })
        })
    })
  }, [])

  useEffect(() => {
    window.electron.onReadyStateChanged((event, data) => {
      console.log('onReadyStateChanged', event, data)
    })
    const t = setInterval(() => {
      window.electron.fetchState().then((r: BackgroundModule) => {
        console.log('fetchstate', r)
        setModuleState(r)
        if (r.up4w.port && r.up4w.ret === 1) {
          window.electron.getCurrentUser().then(async (doc) => {
            if (!doc) {
              const address = await window.electron.generateUser('12345678')
              setAddress(address)
              navigate('/chatroom', {
                state: { conversation: '', up4w: r.up4w },
              })
              // navigate('/signup')
              return
            }
            const { address } = doc
            setAddress(address)
            if (doc.isLock) {
              return navigate('/signin')
            }
            setTimeout(() => {
              getConversation(r.up4w)
            }, 500)
          })
        }
      })
    }, 2000)
    return () => clearInterval(t)
  }, [])
  return (
    <div
      className='flex flex-col items-center justify-center h-full text-white'
      style={{
        background: `url(${logoImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <ul className='rounded-[8px] w-[300px] bg-white/5 p-[10px] mt-[10px] leading-[22px] absolute right-0 bottom-0'>
        {/* <li className='font-regular text-[13px]'>
          UP4W initialize {moduleState?.up4w ? 'done' : '...'}
        </li> */}
      </ul>
    </div>
  )
}
