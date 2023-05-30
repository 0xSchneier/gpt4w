import Datastore, { RemoveOptions } from 'nedb'
import { promisify } from 'node:util'
import { join } from 'node:path'
// import { v4 as uuidv4 } from 'uuid'

import { MessageDoc } from '../../model/message'
import BaseStore from './base'

class MessageStore extends BaseStore {
  store: Datastore

  constructor() {
    super()

    this.store = new Datastore({
      autoload: true,
      filename: join(this.savePath, 'messages'),
    })

    this.store.ensureIndex({ fieldName: 'id' })
  }

  insert(params: MessageDoc[]) {
    const insert = promisify<MessageDoc[], MessageDoc[]>(
      this.store.insert.bind(this.store)
    )
    return insert(params)
  }

  getByConversationId(id: string) {
    const find = promisify<Pick<MessageDoc, 'conversationId'>, any>(
      this.store.find.bind(this.store)
    )
    return find({ conversationId: id })
  }

  find(id: string): Promise<MessageDoc> {
    const find = promisify<Pick<MessageDoc, 'id'>, any>(
      this.store.findOne.bind(this.store)
    )
    return find({ id })
  }

  findByParentId(parentId: string): Promise<MessageDoc> {
    const find = promisify<Pick<MessageDoc, 'parentMessageId'>, any>(
      this.store.findOne.bind(this.store)
    )
    return find({ parentMessageId: parentId })
  }

  remove(id: string) {
    const remove = promisify<Pick<MessageDoc, 'id'>, any>(
      this.store.remove.bind(this.store)
    )
    return remove({ id })
  }

  removeConversationMessages(conversationId: string) {
    const remove = promisify<
      Pick<MessageDoc, 'conversationId'>,
      RemoveOptions,
      any
    >(this.store.remove.bind(this.store))
    return remove({ conversationId }, { multi: true })
  }

  async removePair(id: string) {
    const answer = await this.findByParentId(id)
    const ids: Pick<MessageDoc, 'id'>[] = [{ id }, { id: answer?.id }].filter(
      (doc) => !!doc.id
    )
    return Promise.all(ids.map((msg) => this.remove(msg.id)))
  }
}

export default new MessageStore()
