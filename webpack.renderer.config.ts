import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { plugins } from './webpack.plugins'

import { getStyleLoaders } from './tools/get-loaders'

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/

const isEnvProduction = process.env.NODE_ENV === 'production'
const sourceMap = !isEnvProduction

const ruleList = [
  {
    test: cssRegex,
    exclude: cssModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 1,
        sourceMap,
        modules: {
          mode: 'icss',
        },
      },
      '',
      isEnvProduction
    ),
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true,
  },
  {
    test: cssModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 1,
        sourceMap: sourceMap,
        modules: {
          mode: 'local',
        },
      },
      '',
      isEnvProduction
    ),
  },
  // Opt-in support for SASS (using .scss or .sass extensions).
  // By default we support SASS Modules with the
  // extensions .module.scss or .module.sass
  {
    test: sassRegex,
    exclude: sassModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 3,
        sourceMap,
        modules: {
          mode: 'icss',
        },
      },
      'sass-loader',
      isEnvProduction
    ),
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true,
  },
  // Adds support for CSS Modules, but using SASS
  // using the extension .module.scss or .module.sass
  {
    test: sassModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 3,
        sourceMap: isEnvProduction,
        modules: {
          mode: 'local',
        },
      },
      'sass-loader',
      isEnvProduction
    ),
  },
  // Fonts
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  },
  // Images
  {
    test: /\.(png|jpg|jpeg|gif)$/i,
    type: 'asset/resource',
  },
  // SVG
  {
    test: /\.svg$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          prettier: false,
          svgo: false,
          svgoConfig: {
            plugins: [{ removeViewBox: false }],
          },
          titleProp: true,
          ref: true,
        },
      },
      'file-loader',
    ],
  },
].filter(Boolean)

rules.push.apply(rules, ruleList)

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: plugins.filter(Boolean) as any,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss'],
  },
}
