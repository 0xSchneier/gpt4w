import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import Guide from './Guide'
import {
  BotMessageCardLoading,
  BotMessageCard,
  BotMessageErrorCard,
  UserMessageCard,
} from './components/MessageCard'
import { ConversationDoc } from '../../model/conversation'
import { MessageDoc } from '../../model/message'
import Status from '../../components/Status'
import TextArea from '../../components/TextArea'
import { shake } from '../../utils/shake'
import { findLast } from '../../utils/array'
import Setting from './components/Setting'
import Up4wjs from 'up4w-js'
import { UserDoc } from '../../model/user'
interface MessageItem extends MessageDoc {
  noAnimation?: boolean
}

const WAIT_TIME = 60

const TARGET_PK = '8cDE3HRUFQLKAdLk0OtJMfELR0MyLXv9brJyFXFZNdA='
export default function Chatroom() {
  const [conversationId, setConverId] = useState('')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [msgList, setMsgList] = useState<MessageItem[]>([])
  const [showGen, setShowGen] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [val, setVal] = useState('')
  const [showStopBtn, setShowStopBtn] = useState(false)

  const {
    state: { conversation, up4w },
  } = useLocation()
  const user = useRef<UserDoc>()
  const latestReq = useRef<MessageItem>()
  const wsClient = useRef<Up4wjs>()
  const waitTimerRef = useRef<NodeJS.Timeout>()
  const bottomRef = useRef<HTMLDivElement>()
  const typingRef = useRef<{ stop: () => void }>()

  // When message changed
  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.currentTarget.value)
  }, [])

  // regenerate answer
  const reGenerate = async () => {
    setShowGen(false)
    setDisabled(true)
    const { id, text, conversationId, role, parentMessageId } =
      latestReq.current
    // replace old question and it's answer
    const list = Array.from(msgList)
    const index = list.findIndex((l) => l.id === id)

    // remove old message end answer
    await window.electron.message.remove(list[index].id)

    list.splice(index, 2)

    sendNewMessage(
      {
        id,
        text,
        conversationId,
        role,
        parentMessageId,
        timestamp: Date.now(),
      },
      list
    )
  }

  const sendNewMessage = async (
    params: MessageItem,
    oldMessageList: MessageItem[] = msgList
  ) => {
    setLoading(true)
    setDisabled(true)
    const { conversationId, id, parentMessageId, text, timestamp } = params
    const list = Array.from(oldMessageList)
    const newMessage: MessageItem = shake({
      id,
      text,
      role: 'user',
      conversationId,
      parentMessageId,
      timestamp,
    }) as MessageItem

    list.push(newMessage)
    setMsgList(list)
    setVal('')
    const content = JSON.stringify({
      requestId: id,
      message: newMessage.text,
      parentMessageId: list[list.length - 2]?.id,
      userId: user.current?.address,
      limit: 64,
    })

    // Show retry button after 60s
    waitTimerRef.current = setTimeout(() => {
      setShowGen(true)
      setLoading(false)
      setDisabled(true)
    }, WAIT_TIME * 1000)

    try {
      await wsClient.current.msg.sendText({
        recipient: TARGET_PK,
        app: 1,
        action: 4096,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        content,
        content_type: 13,
      })
      setErrMsg('')
    } catch (err) {
      setErrMsg(err?.message || err)
    }

    // setShowGen(false)
    // save the new question
    await window.electron.message.add([newMessage])

    latestReq.current = {
      conversationId,
      id,
      parentMessageId,
      text,
      role: 'user',
      timestamp,
    }
  }

  // Send Message
  const handleSend = useCallback(() => {
    if (loading || disabled || !val) return
    const tail = msgList[msgList.length - 1]
    const message: MessageItem = {
      conversationId,
      text: val,
      id: uuidv4(),
      role: 'user',
      timestamp: Date.now(),
    }

    if (tail) {
      message.parentMessageId = tail.id
    }
    sendNewMessage(message)
  }, [conversationId, msgList, val, sendNewMessage, loading, disabled])

  // Create new conversation
  const handleConversationCreate = useCallback(
    async (conversation: ConversationDoc) => {
      const { uid, topic } = conversation
      setConverId(uid)
      sendNewMessage({
        conversationId: uid,
        id: uuidv4(),
        text: topic,
        role: 'user',
        timestamp: Date.now(),
      })
    },
    [wsClient.current, sendNewMessage]
  )

  // Remove specified message and it's assistant
  const handleRemoveMessage = async (id: string) => {
    // replace old question and it's answer
    const list = Array.from(msgList)
    const index = list.findIndex((l) => l.id === id)
    let lastQuestion = findLast<MessageItem>(
      list,
      (item) => item.role === 'user'
    )
    // remove old message and answer
    await window.electron.message.remove(list[index].id)

    // when remove the last question
    if (lastQuestion.id === id) {
      waitTimerRef.current && clearTimeout(waitTimerRef.current)
      setDisabled(false)
      setShowGen(true)
      setLoading(false)
    }

    list.splice(index, 2)
    setMsgList(list)

    // resign lastReq
    lastQuestion = findLast<MessageItem>(list, (item) => item.role === 'user')
    latestReq.current = lastQuestion

    if (!list.length) {
      waitTimerRef.current && clearTimeout(waitTimerRef.current)
      setConverId('')
    }
  }

  const sortMessages = useCallback((data: MessageItem[]) => {
    const userMessages: MessageItem[] = data
      .sort((prev, next) => prev.timestamp - next.timestamp)
      .filter((m) => m.role === 'user')
  }, [])

  useEffect(() => {
    const init = async () => {
      if (!wsClient.current && up4w?.port) {
        wsClient.current = new Up4wjs(`ws://127.0.0.1:${up4w.port}/api`)
        const currentUser = (user.current =
          await window.electron.getCurrentUser())

        await wsClient.current.whenReady({
          app_name: 'deso',
          mrc: {
            msgs_dir: ':mem',
            default_swarm: 'UQnjtCsvHUckWCzGnCGYYkSOMLE=',
            flags: ['delay00_load'],
          },
          mlt: {},
          gdp: {},
          pbc: {},
          lsm: {},
        })
        await wsClient.current.contact.signin(currentUser.seed, null, {
          name: currentUser.address,
        })
        await wsClient.current.contact.addUser({
          pk: TARGET_PK,
          name: 'GPT4W (Robot)',
          greeting_secret:
            'T2jSHJbX0c+2aE+ccPfCFMVP/eFbHlTf5Zsv3OcaLtw=',
        })
      }
    }
    init()
  }, [up4w?.port])

  useEffect(() => {
    if (conversation) {
      window.electron.message
        .getByConversationId(conversation)
        .then((originList) => {
          let sorted: MessageItem[] = originList.map((msg) => ({
            ...msg,
            noAnimation: true,
          }))
          const len = sorted.length
          sorted = sorted.sort((prev, next) => prev.timestamp - next.timestamp)
          const lastQuestion = findLast<MessageItem>(
            sorted,
            (item) => item.role === 'user'
          )
          setMsgList(sorted)
          // resume the conversation for not unseemly ending
          if (sorted[len - 1] && sorted[len - 1].role === 'user') {
            setDisabled(true)
          }
          // console.log(lastQuestion, 'lastQuestion')
          latestReq.current = lastQuestion
          setShowGen(true)
        })
    }
  }, [conversation])

  const onBotStart = useCallback(() => {
    console.log('bot start')
    setShowStopBtn(true)
  }, [])

  const stopAnimate = useCallback(() => {
    console.log('stop animate')
    typingRef.current.stop()
    setShowStopBtn(false)
    setShowGen(true)
  }, [])

  const onBotFinish = useCallback(() => {
    setShowGen(true)
    setShowStopBtn(false)
  }, [])

  useEffect(() => {
    if (conversation) {
      setConverId(conversation)
    }
  }, [conversation])

  useEffect(() => {
    const bottom = bottomRef.current
    if (bottom) {
      bottom.scrollIntoView({ behavior: 'smooth' })
    }
  }, [msgList])

  useEffect(() => {
    if (wsClient.current) {
      const reciveMsg = async (data: any) => {
        const {
          ret: { content, recipient, action },
          rsp,
        } = data
        let response: any = {}
        try {
          response = JSON.parse(content.replace(/(\\")/g, '"'))
        } catch (ex) {
          console.warn('Can not parse data: ', ex)
          response = JSON.parse(content)
        }
        const { data: contentObj, code, message } = response
        const latestMsg = msgList[msgList.length - 1]
        const isLastUser = latestMsg && latestMsg.role === 'user'
        const isError = code !== 0 && action === 4097 && isLastUser
        const isUserAndIsLastRequest = 
          isLastUser && latestReq.current && 
          latestMsg && (latestMsg.id === contentObj?.requestId)
        const isTargetRecived =
          rsp === 'msg.received' &&
          action === 4097 &&
          typeof content === 'string'
        
        console.log('Received: ', contentObj, latestMsg)
        if ((isUserAndIsLastRequest && isTargetRecived) || isError) {
          const list = Array.from(msgList)
          const answer: MessageItem = {
            id: isError ? uuidv4() : contentObj.id,
            text: isError ? message : contentObj.reply,
            conversationId: latestReq.current?.conversationId,
            role: 'assistant',
            parentMessageId: latestReq.current?.id,
            timestamp: Date.now(),
            isError,
          }
          waitTimerRef.current && clearTimeout(waitTimerRef.current)
          list.push(answer)
          setMsgList(list)
          setLoading(false)
          setShowGen(true)
          setDisabled(false)

          await window.electron.message.add([answer])
        }
      }
      const clearOnMessage = wsClient.current.msg.onMessage(reciveMsg)
      return () => {
        clearOnMessage && clearOnMessage()
      }
    }
  }, [wsClient.current, msgList, latestReq.current, msgList])

  const handleClearCover = () => {
    latestReq.current = null
    waitTimerRef?.current && clearTimeout(waitTimerRef.current)
    setConverId('')
    setMsgList([])
    setShowGen(false)
    setDisabled(false)
    setLoading(false)
  }

  return conversationId && msgList.length ? (
    <div className='relative flex items-start justify-center w-full h-full overflow-auto'>
      <div className='w-full pb-[180px]'>
        <ul>
          {msgList.map((msg) => {
            return msg.role === 'user' ? (
              <UserMessageCard
                key={msg.id}
                text={msg.text}
                id={msg.id}
                onRemoveMessage={() => handleRemoveMessage(msg.id)}
              />
            ) : (
              <BotMessageCard
                key={msg.id}
                text={msg.text}
                isError={msg.isError}
                onFinish={onBotFinish}
                onStart={onBotStart}
                typingRef={typingRef}
                noAnimation={true}
              />
            )
          })}
          {/* {errMsg && !loading && <BotMessageErrorCard error={errMsg} />} */}
          {loading && <BotMessageCardLoading />}
        </ul>
        <div ref={bottomRef}></div>
      </div>
      <div className='fixed bottom-[45px] flex content-center items-center'>
        {showStopBtn && (
          <div className='absolute w-full top-[-66px] flex justify-center items-center'>
            <Status
              onClick={stopAnimate}
              type='success'
              message='Stop Animation'
            />
          </div>
        )}
        {showGen && !loading && (
          <div className='absolute w-full top-[-66px] flex justify-center items-center'>
            <Status
              onClick={reGenerate}
              type='progress'
              message='Regenerating Response'
            />
          </div>
        )}
        <TextArea
          onChange={onChange}
          className='relative'
          value={val}
          disabled={disabled}
          onSend={handleSend}
        />
        <Setting conversationId={conversationId} onClear={handleClearCover} />
      </div>
    </div>
  ) : (
    <Guide onSubmit={handleConversationCreate} loading={loading} />
  )
}
