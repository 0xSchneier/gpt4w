import { getResourcePath } from './utils'

import express, { Application } from 'express'
import Http from 'http'
import { app } from 'electron'
import { rechargeLog } from '../utils/logs'
const path = require('path')
const { shell } = require('electron')
const net = require('net')

class RechargeServer {
  currentPath: string
  assetsPath: string
  port: number
  app: Application
  server: Http.Server
  constructor () {
    this.currentPath = path.join(__dirname, '..', 'renderer', 'recharge')
    this.assetsPath = path.join(getResourcePath(), 'assets')
    this.app = express()
  }

  async start () {
    // log req path and redirect font
    this.app.use((req, res, next) => {
      rechargeLog.info(`${req.method}: ${req.path}`)
      if (req.path.match(/^\/\S+\.woff2$/)) {
        res.sendFile(path.join(this.currentPath, '..', req.path))
      } else {
        next()
      }
    })
    this.app.use('/', express.static(this.currentPath))
    this.app.use('/recharge', express.static(this.currentPath))
    this.app.use('/css', express.static(path.join(this.currentPath, '..', 'css')))
    this.app.use('/assets', express.static(this.assetsPath))
    this.app.use(async (err: any, req: any, res: any, next: any) => {
      res.status(err.statusCode || 500).send({
        message: err.message
      })
      rechargeLog.error(err)
    })
    this.port = await RechargeServer.findPort(3000) as number
    this.server = this.app.listen(this.port, () => {
      // cb && cb('http://localhost:5050')
      shell.openExternal(`http://localhost:${this.port}`)
      rechargeLog.info(`http://localhost:${this.port}`)
    })
  }
  // destroy server
  destroy () {
    this.server && this.server.close(() => {
      rechargeLog.info(`http://localhost:${this.port} had closed`)
      
    })
  }

  static async findPort (defaultPort: number) {
    const server = net.createServer(() => { })

    function getport(port: number, callback?: (err: any, port: number) => void) {
      function onListen() {
        callback && callback(null, port);
        server.removeListener('error', onError);
        server.removeListener('listening', onListen);
        server.close(); 
      }

      function onError() {
        server.removeListener('error', onError);
        server.removeListener('listening', onListen);
        getport(port + 1, callback)
      }
      server.once('error', onError);
      server.once('listening', onListen);
      server.listen(port);
    }

    return new Promise((resolve, reject) => {
      getport(defaultPort, (err, port: number) => {
        resolve(port)
      })
    })
  }
}


export default RechargeServer