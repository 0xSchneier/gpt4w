import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
// import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerDMG } from '@electron-forge/maker-dmg'
// import { MakerPKG } from '@electron-forge/maker-pkg'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

// 'darwin', 'freebsd', 'linux', 'sunos' , 'win32'
const extraResource = [
  'node_modules/koffi/build',
  'assets',
  `addons/${process.platform}`,
]

const config: ForgeConfig = {
  packagerConfig: {
    extraResource,
    icon: './assets/icons/icon.ico',
    name: 'GPT4W',
    overwrite: true,
    executableName: 'gpt4w',
  },
  rebuildConfig: {},
  makers: [
    // Create a Windows installer for your Electron app
    // https://www.electronforge.io/config/makers/squirrel.windows
    new MakerSquirrel({
      // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
      // iconUrl: 'assets/icon.ico',
      // The ICO file to use as the icon for the generated Setup.exe
      loadingGif: './assets/icons/icon.ico',
      setupIcon: './assets/icons/icon.ico',
      authors: 'GPT4W.DEV',
      description: 'chatbot base on UP4W',
    }),
    // Create a ZIP file for your Electron app
    // https://www.electronforge.io/config/makers/zip
    new MakerZIP({}, ['darwin']),
    // Create an RPM package for RedHat-based Linux distributions for your Electron app
    // https://www.electronforge.io/config/makers/rpm
    // new MakerRpm({}),
    // Create a package for Debian-based Linux distributions for your Electron app
    // https://www.electronforge.io/config/makers/deb
    new MakerDeb({
      options: {
        icon: './assets/icons/128x128.png',
      },
    }),
    new MakerDMG({
      background: './assets/arrow.png',
      format: 'ULFO',
    }),
    // new MakerPKG(),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy:
        "default-src * 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:*; img-src * 'self' data:",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
          {
            html: './src/recharge/index.html',
            js: './src/recharge/main.ts',
            name: 'recharge',
            nodeIntegration: false,
          },
        ],
      },
      port: 8100,
      loggerPort: 8200,
    }),
  ],
}

export default config
