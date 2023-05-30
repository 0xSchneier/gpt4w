import electronLog from 'electron-log'

const log = electronLog.create({
  logId: 'App',
})

const up4wLog = electronLog
  .create({
    logId: 'UP4W',
  })
  .scope('up4w')

const rechargeLog = electronLog.create({
  logId: 'recharge',
})
rechargeLog.transports.file.fileName = 'recharge.log'

export { log, up4wLog, rechargeLog }
