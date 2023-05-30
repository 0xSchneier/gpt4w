import Datastore from 'nedb'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { v4 as uuidv4 } from 'uuid'

import BaseStore from './base'
import { ConversationDoc } from '../../model/conversation'

class ConversationStore extends BaseStore {
  store: Datastore

  constructor() {
    super()

    this.store = new Datastore({
      autoload: true,
      filename: join(this.savePath, 'conversations'),
    })
    // this.store.ensureIndex({ fieldName: 'uid' })
  }

  create(topic: string, uid: string) {
    // const uid = uuidv4()
    const insert = promisify<ConversationDoc, ConversationDoc>(
      this.store.insert.bind(this.store)
    )
    return insert({ topic, uid })
  }

  findByUid = (uid: string) => {
    const find = promisify<Pick<ConversationDoc, 'uid'>, any>(
      this.store.findOne.bind(this.store)
    )
    return find({ uid })
  }

  findAll = (): Promise<ConversationDoc[]> => {
    const find = promisify(this.store.find.bind(this.store))
    return find({})
  }

  removeById(uid: string): Promise<number> {
    const remove = promisify<Pick<ConversationDoc, 'uid'>, any>(
      this.store.remove.bind(this.store)
    )
    return remove({ uid })
  }
}

export default new ConversationStore()
