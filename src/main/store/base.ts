import { EventEmitter } from 'node:events'
import { join } from 'node:path'
import { log } from '../../utils/logs'
import { getSavePath } from '../utils'

export default class BaseStore extends EventEmitter {
  savePath = process.cwd()

  constructor() {
    super()
    this.savePath = join(getSavePath(), 'gpt4w-data')
    log.scope('database').info('save data to', this.savePath)
  }
}
