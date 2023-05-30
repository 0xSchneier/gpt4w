// import showNotification from './notification'
import MainApp from './main-process'
import { log } from '../utils/logs'
// import Extenssion from './extensions'

try {
  const mainApp = new MainApp()
  // After app ready event trigger
  mainApp.onAppReady(() => {
    // new Extenssion().install()
  })
  mainApp.start()
} catch (ex) {
  log.error('App error', ex)
}

process.on('uncaughtException', (error) =>
  log.scope('uncaughtException').error(error)
)

process.on('unhandledRejection', (error) => {
  log.scope('unhandledRejection').error(error)
})
