import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer'

import { log } from '../utils/logs'

interface ExtensionItem {
  id: string
  electron: string
}
export default class Extensions {
  log = log.scope('init extenssion')
  items: ExtensionItem[] = []

  constructor() {
    this.addReactDevTool()
    // this.addMetaMask()
  }

  install() {
    installExtension(this.items)
      .then((name) => this.log.info(`Added Extension:  ${name}`))
      .catch((err) => this.log.error('An error occurred: ', err))
  }

  addReactDevTool() {
    this.items.push(REACT_DEVELOPER_TOOLS)
  }

  addMetaMask() {
    this.items.push({
      id: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
      electron: '23',
    })
  }
}
