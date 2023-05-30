import { ipcMain, nativeTheme, IpcMainInvokeEvent } from 'electron'

import type MainProcess from '../main-process'
import { APPEvent } from '../../constants'
import converStore from '../store/conversations'
import msgStore from '../store/messages'
import userStore from '../store/users'
import { MessageDoc } from '../../model/message'

export default class EventHanders {
  context: MainProcess

  constructor(main: MainProcess) {
    this.context = main

    this.readyState()
    this.toggleTheme()
    this.getConversations()
    this.getConversationById()
    this.createConversation()
    this.removeConversationById()
    this.handleMessage()
    this.getCurrentUser()
    this.generateUser()
    this.lock()
    this.validatePwd()
    this.reset()
  }

  readyState() {
    ipcMain.handle(APPEvent.READY_STATE, () => this.context.state)
  }

  toggleTheme() {
    ipcMain.handle('dark-mode:toggle', () => {
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
      } else {
        nativeTheme.themeSource = 'dark'
      }
      return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('dark-mode:system', () => {
      nativeTheme.themeSource = 'system'
    })
  }

  // Get all conversations
  getConversations() {
    ipcMain.handle(APPEvent.GET_CONVERSATIONS, () => {
      return converStore.findAll()
    })
  }

  getConversationById() {
    ipcMain.handle(APPEvent.GET_FRIST_CONVERSATION, (_, uid: string) => {
      return converStore.findByUid(uid)
    })
  }

  removeConversationById() {
    ipcMain.handle(APPEvent.REMOVE_CONVERSATION, (_, uid: string) => {
      return converStore.removeById(uid)
    })
  }

  // Create Conversation
  createConversation() {
    ipcMain.handle(
      APPEvent.CREATE_CONVERSATION,
      (_: IpcMainInvokeEvent, topic: string, uid: string) => {
        return converStore.create(topic, uid)
      }
    )
  }

  handleMessage() {
    // remove message
    ipcMain.handle(
      APPEvent.REMOVE_MESSAGE,
      (_: IpcMainInvokeEvent, id: string) => {
        return msgStore.removePair(id)
      }
    )
    // get messages by conversationid
    ipcMain.handle(
      APPEvent.GET_MESSAGES_BY_CONVERSATION,
      (_: IpcMainInvokeEvent, id: string) => {
        return msgStore.getByConversationId(id)
      }
    )
    // save message
    ipcMain.handle(
      APPEvent.ADD_MESSAGE,
      (_: IpcMainInvokeEvent, docs: MessageDoc[]) => {
        return msgStore.insert(docs)
      }
    )

    // remove all message by conversation id
    ipcMain.handle(
      APPEvent.REMOVE_CONVERSATION_MESSAGES,
      (_: IpcMainInvokeEvent, id: string) => {
        return msgStore.removeConversationMessages(id)
      }
    )
  }

  getCurrentUser() {
    ipcMain.handle(APPEvent.GET_CURRENT_USER, (_: IpcMainInvokeEvent) => {
      return userStore.getUser()
    })
  }

  generateUser() {
    ipcMain.handle(APPEvent.GENERATE_USER, (_: IpcMainInvokeEvent, paw: string) => {
      return userStore.generateUser(paw)
    })
  }

  lock() {
    ipcMain.handle(APPEvent.LOCK, (_: IpcMainInvokeEvent) => {
      return userStore.lock()
    })
  }

  validatePwd() {
    ipcMain.handle(APPEvent.VALIDATE_PWD, (_: IpcMainInvokeEvent, pwd: string) => {
      return userStore.validatePwd(pwd)
    })
  }

  reset() {
    ipcMain.handle(APPEvent.RESET, (_: IpcMainInvokeEvent) => {
      return userStore.reset()
    })
  }
}
