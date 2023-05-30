import { EventEmitter } from 'node:events'

import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { log } from '../utils/logs'

export interface MessageReq {
  req: string
  tik?: string
}

export interface MessageResWithTik {
  ack: string
  ret: any
  tik: string
}

export interface MessageRes {
  evt: string
  pld: {
    mod: number
    eid: number
  }
}

interface ForceConnectOptions {
  endpoint: string
  repeat: number
  interval?: number
  onMessage: MessageHandler
  onError?: ErrorHandler
  onOpen?: OpenHandler
}

type ErrorHandler = (err: Error, detail: { data: any }) => void
type MessageHandler = (
  data: MessageRes & MessageResWithTik,
  ws: WebSocket
) => void
type OpenHandler = (client: WebSocketClient, ws: WebSocket) => void

export class WebSocketClient extends EventEmitter {
  endpoint: string
  ws: WebSocket
  maxCount = 10
  count = 0

  constructor(endpoint: string) {
    super()
    this.endpoint = endpoint
    this.ws = new WebSocket(this.endpoint)
  }

  static async forceConnect(
    params: ForceConnectOptions
  ): Promise<WebSocketClient> {
    let count = 0
    let client: WebSocketClient

    const {
      endpoint,
      repeat,
      onError,
      onMessage,
      onOpen,
      interval = 1000,
    } = params

    return new Promise((resolve, reject) => {
      const connect = () => {
        count += 1
        log.info(`websocket do connect again(${count})`)
        client = new WebSocketClient(endpoint)
        client.onOpen(() => {
          onOpen?.(client, client.ws)
          resolve(client)
        })
        client.onMessage(onMessage)
        client.onError((error: Error, detail: { data: any }) => {
          onError?.(error, detail)
          if (error.message.includes('ECONNREFUSED')) {
            if (count + 1 > repeat) {
              log.error('Websocket connect failed: ', error.message)
              reject(error.message)
            }
            setTimeout(connect, interval)
            return
          }
          reject(error.message)
        })
      }
      connect()
    })
  }

  onError(callback: ErrorHandler) {
    this.on('error', callback)
    this.ws.on('error', callback)
  }

  onOpen(callback: OpenHandler) {
    this.ws.on('open', () => {
      callback(this, this.ws)
    })
  }

  onMessage(callback: MessageHandler) {
    this.ws.on('message', (data: any) => {
      try {
        const d = JSON.parse(data.toString())
        callback(d, this.ws)
      } catch (ex) {
        this.emit('error', ex, { message: data?.toString() })
      }
    })
  }

  send(message: MessageReq) {
    const ticket = uuidv4()
    message.tik = message.tik ?? ticket
    const payload = JSON.stringify(message)
    this.ws.send(payload)
    return message.tik
  }
}
