// const BackgroundEvent = {}

enum APPEvent {
  READY_STATE = 'background_ready_state',
  GET_FRIST_CONVERSATION = 'get_first_conversation',
  SEND_MESSGAE = 'send_message',
  CREATE_CONVERSATION = 'create_conversation',
  GET_CONVERSATIONS = 'get_conversations',
  REMOVE_CONVERSATION = 'remove_conversation',
  ADD_MESSAGE = 'add_message',
  REMOVE_MESSAGE = 'remove_message',
  GET_MESSAGES_BY_CONVERSATION = 'get_messages_by_conversation',
  REMOVE_CONVERSATION_MESSAGES = 'remove_conversation_messages',
  GET_CURRENT_USER = 'get_current_user',
  GENERATE_USER = 'genetate_user',
  LOCK = 'lock',
  VALIDATE_PWD = 'validatePwd',
  RESET = 'reset',
}

export interface BackgroundModule {
  up4w: {
    ret: number | null
    port: number | null
  }
}

export { APPEvent }
