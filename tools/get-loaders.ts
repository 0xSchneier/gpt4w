import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const useTailwind = true

const getStyleLoaders = (
  cssOptions: any,
  preProcessor: string,
  isEnvProduction = false
) => {
  const isDev = !isEnvProduction
  const loaders = [
    isDev && require.resolve('style-loader'),
    isEnvProduction && { loader: MiniCssExtractPlugin.loader },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in package.json
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          config: false,
          plugins: !useTailwind
            ? [
                'postcss-flexbugs-fixes',
                [
                  'postcss-preset-env',
                  {
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  },
                ],
                // Adds PostCSS Normalize as the reset css with default options,
                // so that it honors browserslist config in package.json
                // which in turn let's users customize the target behavior as per their needs.
                'postcss-normalize',
              ]
            : [
                'tailwindcss',
                'postcss-flexbugs-fixes',
                [
                  'postcss-preset-env',
                  {
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  },
                ],
              ],
        },
        sourceMap: !isEnvProduction,
      },
    },
  ].filter(Boolean)

  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: !isEnvProduction,
      },
    })
  }
  return loaders
}

export { getStyleLoaders }
