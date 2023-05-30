import type { Configuration } from 'webpack'
import os from 'node:os'
import CopyPlugin from 'copy-webpack-plugin'

import { rules } from './webpack.rules'

const version = require('koffi/package.json').version
const arch = os.arch()
const platform = os.platform()
const koffiBuild = `koffi_${platform}_${arch}`

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: './src/main/index.ts',
    'up4w-server': './src/main/up4w-server.ts',
  },
  output: {
    filename: '[name].js',
  },
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: `node_modules/koffi/build/${version}/${koffiBuild}/koffi.node`,
          to: `../build/${version}/${koffiBuild}/`,
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
}
