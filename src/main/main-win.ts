import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app,
  Menu,
  dialog,
  Tray,
} from 'electron'
import path from 'node:path'
import { resolveAssetPath } from './utils'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

export default class MainWin {
  browserWindow: BrowserWindow
  tray: Tray
  options?: BrowserWindowConstructorOptions
  onReadyToShow?: (win: BrowserWindow) => void
  onReadyToShowOnce?: (win: BrowserWindow) => void
  uri: string

  constructor(config: {
    uri?: string
    options?: BrowserWindowConstructorOptions
    onReadyToShow?: (win: BrowserWindow) => void
    onReadyToShowOnce?: (win: BrowserWindow) => void
  }) {
    this.uri = config.uri || MAIN_WINDOW_WEBPACK_ENTRY
    this.options = config.options
    this.onReadyToShow = config.onReadyToShow
    this.onReadyToShowOnce = config.onReadyToShowOnce
    this.create()
  }

  get window() {
    return this.browserWindow
  }

  create = () => {
    const defaultOption: BrowserWindowConstructorOptions = {
      height: 640,
      width: 1200,
      minWidth: 437,
      minHeight: 585,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: true,
        spellcheck: false,
      },
      icon: resolveAssetPath('icon.png'),
      frame: true,
    }
    const options = Object.assign(this.options || {}, defaultOption)
    const mainWindow = (this.browserWindow = new BrowserWindow(options))
    mainWindow.setMenuBarVisibility(false)

    if (process.platform === 'darwin') {
      // mac hide menu
      const template = [
        {
          label: 'GPT4W',
          submenu: [
            {
              label: 'Quit',
              accelerator: 'Command+Q',
              click: function () {
                app.quit()
              },
            },
          ],
        },
        {
          label: 'Edit',
          submenu: [
            { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
            {
              label: 'Redo',
              accelerator: 'Shift+CmdOrCtrl+Z',
              selector: 'redo:',
            },
            { type: 'separator' },
            { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
            { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
            { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
            {
              label: 'Select All',
              accelerator: 'CmdOrCtrl+A',
              selector: 'selectAll:',
            },
          ],
        },
      ] as any
      Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    } else {
      // win/centos hide menu
      Menu.setApplicationMenu(null)
    }
    // and load the index.html of the app.
    mainWindow.loadURL(this.uri)

    this.readyToShow()
    this.setTray()
    return mainWindow
  }

  private readyToShow() {
    const mainWindow = this.browserWindow

    mainWindow.once('ready-to-show', async () => {
      this.onReadyToShowOnce?.(mainWindow)
    })

    mainWindow.on('ready-to-show', async () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined')
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize()
      } else {
        mainWindow.show()
      }
      this.onReadyToShow(this.browserWindow)
      // Open the DevTools.
      if (!app.isPackaged) {
        mainWindow.webContents.openDevTools()
      }
    })
    mainWindow.on('close', (event) => {
      const result = dialog.showMessageBoxSync(mainWindow, {
        type: 'info',
        buttons: ['Minimize to the tray', 'Exit'],
        title: 'tips',
        message: 'Are you sure you want to exit?',
        defaultId: 2,
        cancelId: 3,
      })
      event.preventDefault()
      if (
        result === 0
      ) {
        mainWindow.hide()
        mainWindow.setSkipTaskbar(true)
      }  else if (result === 1) {
        app.exit()
      }
    })
    app.on('activate', () => {
      mainWindow.show()
      mainWindow.setSkipTaskbar(false)
    })
  }

  setTray() {
    this.tray = new Tray(resolveAssetPath(path.join('icons', process.platform !== 'darwin' ? '24x24.png' : '16x16.png')))
    this.tray.setToolTip('GPT4W')

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'quit',
        click: () => {
          app.exit()
        },
      },
    ])

    this.tray.setContextMenu(contextMenu)
    this.tray.on('click', () => {
      this.browserWindow.show()
    })
  }
}
