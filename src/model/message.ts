export interface MessageDoc {
  id: string
  conversationId: string
  parentMessageId?: string
  text: string
  role: 'user' | 'assistant'
  timestamp: number
  isError?: boolean
}
