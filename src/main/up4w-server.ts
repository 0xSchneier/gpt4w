import minimist from 'minimist'
import koffi from 'koffi'
import path from 'path'
import fs from 'fs'

const args = minimist(process.argv.slice(2))
const { resource, appdata } = args

// const lib = loadDll(path.join(resource, 'addons/hello_gpt4w_lib.dll'))
let dll = ''

switch (process.platform) {
  case 'darwin':
    dll = 'libup4w_core_shared.dylib'
    break
  case 'win32':
    dll = 'up4w_core_shared.dll'
    break
  case 'linux':
    dll = 'libup4w_core_shared.so'
    break
  default:
    console.error('unsupported platform', process.platform)
}

const fullpath = path.join(resource, `${process.platform}/${dll}`)
const appdataPath = '-data:' + appdata

console.log(fullpath, fs.existsSync(fullpath))
console.log(appdataPath)

function runUP4W() {
  let v = null
  let port = 2000
  let lib: koffi.IKoffiLib | null = null
  if (process.env.UP4W_WEBAPI_PORT) {
    port = Number(process.env.UP4W_WEBAPI_PORT)
    process.send('You are runing UP4W locally in out of GPT4W, port is ' + port)
    return { v: 1, port, lib }
  }

  lib = koffi.load(fullpath)
  const start = lib.func('start', 'int', ['string'])
  const getPort = lib.func('get_api_port', 'int', [])

  v = start(appdataPath)
  port = getPort()
  return { v, port, lib }
}

function init() {
  const { v, port, lib } = runUP4W()
  process.send({
    port: port,
    ret: v,
  })

  setTimeout(() => {
    // Stop connecting memory by gc
    // DO NOT REMOVE IT
    console.log(typeof lib)
  }, 1000 * 3600 * 365)
}

init()
