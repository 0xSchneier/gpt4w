// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { BackgroundModule, APPEvent } from './constants'
import { ConversationDoc } from './model/conversation'
import { MessageDoc } from './model/message'

type EventCallback<T> = (event: IpcRendererEvent, data: T) => void

contextBridge.exposeInMainWorld('electron', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
  onIPCValue: (callback: EventCallback<any>) => {
    ipcRenderer.on('ipc-value', callback)
  },
  onIPCMessage: (callback: EventCallback<any>) => {
    ipcRenderer.on('ipc-message', callback)
  },

  onReadyStateChanged: (callback: EventCallback<BackgroundModule>) => {
    ipcRenderer.on(APPEvent.READY_STATE, callback)
  },

  fetchState: (): Promise<BackgroundModule> => {
    return ipcRenderer.invoke(APPEvent.READY_STATE)
  },

  // getFirstConversation: (): Promise<ConversationDoc | null> => {
  //   return ipcRenderer.invoke(APPEvent.GET_FRIST_CONVERSATION)
  // },

  getConversations: (): Promise<ConversationDoc[] | null> => {
    return ipcRenderer.invoke(APPEvent.GET_CONVERSATIONS)
  },

  getConversationById: (uid: string): Promise<ConversationDoc | null> => {
    return ipcRenderer.invoke(APPEvent.GET_FRIST_CONVERSATION, uid)
  },

  createConversation: (topic: string, uid: string): Promise<ConversationDoc> => {
    return ipcRenderer.invoke(APPEvent.CREATE_CONVERSATION, topic, uid)
  },

  removeConversation: (uid: string): Promise<number> => {
    return ipcRenderer.invoke(APPEvent.REMOVE_CONVERSATION, uid)
  },

  sendMessage: (content: string, conversation: string) => {
    return ipcRenderer.invoke(APPEvent.SEND_MESSGAE, { content, conversation })
  },

  getCurrentUser: () => {
    return ipcRenderer.invoke(APPEvent.GET_CURRENT_USER)
  },

  generateUser: (paw: string) => {
    return ipcRenderer.invoke(APPEvent.GENERATE_USER, paw)
  },

  message: {
    add: (msgs: MessageDoc[]) => {
      return ipcRenderer.invoke(APPEvent.ADD_MESSAGE, msgs)
    },
    remove: (messageId: string) => {
      return ipcRenderer.invoke(APPEvent.REMOVE_MESSAGE, messageId)
    },
    getByConversationId: (id: string) => {
      return ipcRenderer.invoke(APPEvent.GET_MESSAGES_BY_CONVERSATION, id)
    },
    removeConversationMessages: (id: string) => {
      return ipcRenderer.invoke(APPEvent.REMOVE_CONVERSATION_MESSAGES, id)
    },
  },

  lock: () => {
    return ipcRenderer.invoke(APPEvent.LOCK)
  },

  validatePwd: (paw: string) => {
    return ipcRenderer.invoke(APPEvent.VALIDATE_PWD, paw)
  },

  reset: (paw: string) => {
    return ipcRenderer.invoke(APPEvent.RESET)
  }
})
