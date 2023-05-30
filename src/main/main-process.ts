import { app, BrowserWindow, App, net } from 'electron'
import { EventEmitter } from 'events'
import contextMenu from 'electron-context-menu'
import path from 'node:path'
import fs from 'node:fs'
import { fork } from 'child_process'

import MainWin from './main-win'
import { up4wLog, log } from '../utils/logs'
import { getResourcePath } from './utils'
import { WebSocketClient } from '../service/wsclient'
import { APPEvent, BackgroundModule } from '../constants'
import Handlers from './event-handlers'
import RechargeServer from './recharge-server'

interface Context {
  mainWin: BrowserWindow
  app: App
}

type Subscriber = (context: Context) => void
type WinSubs = (context: Context) => void

export default class MainProcess extends EventEmitter {
  mainWin: MainWin

  WSClient: WebSocketClient

  rServer: RechargeServer

  subscribers: Subscriber[] = []
  winSubs: WinSubs[] = []

  up4wPort: number | null = null
  up4wRet: number | null = null

  state: BackgroundModule = {
    up4w: { ret: null, port: null },
  }

  moduleState: BackgroundModule = new Proxy<BackgroundModule>(this.state, {
    set: (target, property: keyof BackgroundModule, newValue) => {
      target[property] = newValue
      if (this.mainWin) {
        this.mainWin.window.webContents.send(APPEvent.READY_STATE, target)
      }
      return true
    },
  })

  constructor() {
    super()
  }

  beforeStart(callback: () => void) {
    const additionalData = { name: 'GPT4W' }
    const locker = app.requestSingleInstanceLock(additionalData)

    if (!locker) {
      app.quit()
    } else {
      app.on(
        'second-instance',
        (event, commandLine, workingDirectory, additionalData) => {
          // Print out data received from the second instance.
          const win = this.mainWin.browserWindow
          // Someone tried to run a second instance, we should focus our window.
          if (win) {
            if (win.isMinimized()) {
              win.restore()
            }
            win.show()
            win.focus()
          }
        }
      )
      callback()
    }
  }

  handleIPCEvents() {
    new Handlers(this)
  }

  onAppReady(fn: Subscriber) {
    this.subscribers.push(fn)
  }

  onWinReady(fn: WinSubs) {
    this.winSubs.push(fn)
  }

  start() {
    this.beforeStart(() => {
      this.initContextMenu()
      this.handleIPCEvents()
      // Handle creating/removing shortcuts on Windows when installing/uninstalling.
      if (require('electron-squirrel-startup')) {
        app.quit()
      }
      // Quit when all windows are closed, except on macOS. There, it's common
      // for applications and their menu bar to stay active until the user quits
      // explicitly with Cmd + Q.
      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit()
        }
      })
      app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
          this.mainWin.create()
        }
      })
      app.on('ready', () => {
        this.mainWin = new MainWin({
          onReadyToShow: (mainWindow) => {
            this.winSubs.forEach((sub) => {
              const context: Context = { mainWin: mainWindow, app }
              sub(context)
            })
          },
          onReadyToShowOnce: (mainWindow) => {
            this.forkUP4W(mainWindow)
          },
        })

        const context: Context = { mainWin: this.mainWin.window, app }
        this.subscribers.forEach((sub) => sub(context))
      })
    })
  }

  // Initialize Context menu when right click
  initContextMenu = () => {
    contextMenu({
      showSaveImageAs: true,
      showSearchWithGoogle: false,
      showSelectAll: false,
    })
  }

  forkUP4W = (mainWindow: BrowserWindow) => {
    const controller = new AbortController()
    const { signal } = controller
    const scriptPath = path.join(__dirname, 'up4w-server.js')
    const appDataPath = path.join(app.getPath('appData'), 'GPT4W')
    const assetsPath = path.join(getResourcePath(), 'assets')
    const localNodes = 'a44u7d1b5seke92o5j39o8coc928sc5h.nodes'
    const bootstrapNodes = 'bootstrap.nodes'
    const appDataLocalNodes = path.join(appDataPath, localNodes)
    const appDataBootstrapNodes = path.join(appDataPath, bootstrapNodes)

    if (
      !fs.existsSync(appDataLocalNodes) ||
      !fs.existsSync(appDataBootstrapNodes)
    ) {
      fs.copyFileSync(path.join(assetsPath, localNodes), appDataLocalNodes)
      fs.copyFileSync(path.join(assetsPath, bootstrapNodes), appDataBootstrapNodes)
      up4wLog.info('copy nodes success: ')
    }

    const scriptArr = [
      `--packaged=${app.isPackaged ? '1' : '0'}`,
      `--resource=${path.join(
        getResourcePath(),
        app.isPackaged ? '' : 'addons'
      )}`,
      `--appdata=${appDataPath}`,
    ]
    const cp = fork(scriptPath, scriptArr, { signal, silent: true })

    cp.on('message', (v: any) => {
      up4wLog.info('revieve up4w child process message: ', v)
      if (v.port && v.ret === 1) {
        this.up4wPort = v.port
        this.up4wRet = v.ret
        this.detectService(`http://127.0.0.1:${v.port}/cmd/api`)
      }
    })

    cp.on('close', (code: number) => {
      up4wLog.warn('child process exit with code:', code)
      this.moduleState.up4w = {
        ret: null,
        port: null,
      }
    })

    // cp.stdout.on('data', (v) => up4wLog.info(v.toString()))
    // cp.stderr.on('data', (v) => up4wLog.error(v.toString()))
    cp.on('error', (error) => up4wLog.error(error.toString()))

    process.on('exit', function () {
      cp.kill()
    })

    // catch ctrl-c
    process.on('SIGINT', () => process.exit())
    // catch kill
    process.on('SIGTERM', () => process.exit())

    // this.initWebSocket('ws://127.0.0.1:12345/api')
    // setTimeout(() => {
    // this.initWS('ws://127.0.0.1:12345/api')

    // this.initWhisperer(mainWindow)
    // }, 3000)
  }

  detectService = (endpoit: string) => {
    let count = 0
    const ping = () => {
      const request = net.request(endpoit)
      request.on('response', (resp) => {
        const { statusCode } = resp
        count += 1
        up4wLog.log('up4w service detect ', count)
        if (statusCode === 200 || statusCode === 403) {
          this.moduleState.up4w = {
            ret: this.up4wRet,
            port: this.up4wPort,
          }
          up4wLog.log('up4w service wake up')
          return
        }
        setTimeout(ping, 1000)
      })
      request.on('error', () => setTimeout(ping, 1000))
      request.end()
    }
    ping()
  }
}
