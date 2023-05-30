import type { ConversationDoc } from '../src/model/conversation'
import type { BackgroundModule } from '../src/constants'
import type { MessageDoc } from '../src/model/message'
import type { UserDoc } from '../src/model/user'

type EventCallback<T> = (event: IpcRendererEvent, data: T) => void
type EventHandler<T = any> = (callback: EventCallback<T>) => void
type Invoker = () => void
type PromiseInvoke<T, A = any> = (args?: A) => Promise<T>

export interface Electron {
  toggle: PromiseInvoke<boolean>
  system: PromiseInvoke<boolean>
  sendMessage: PromiseInvoke<any>
  onIPCValue: EventHandler
  onIPCMessage: EventHandler
  fetchState: PromiseInvoke<any, keyof BackgroundModule>
  getConversationById: PromiseInvoke<ConversationDoc, string>
  getConversations: PromiseInvoke<ConversationDoc[]>
  createConversation: PromiseInvoke<ConversationDoc, string, string>
  removeConversation: PromiseInvoke<number, string>
  onReadyStateChanged: EventHandler
  getCurrentUser: PromiseInvoke<UserDoc>
  generateUser: PromiseInvoke<string>
  lock: PromiseInvoke<void>
  validatePwd: PromiseInvoke<boolean>
  reset: PromiseInvoke<boolean>
  message: {
    add: (msgs: MessageDoc[]) => Promise<any>
    remove: (messageId: string) => Promise<any>
    getByConversationId: (id: string) => Promise<MessageDoc[]>
    removeConversationMessages: (conversationId: string) => Promise<any>
  }
}

declare global {
  interface Window {
    electron: Electron
  }
}
