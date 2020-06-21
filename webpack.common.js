const path = require('path')
const fs = require('fs')
const { ProvidePlugin } = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const FileManagerWebpackPlugin = require('filemanager-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const globby = require('globby')
const handlebars = require('handlebars')
const layouts = require('handlebars-layouts')

const isProd = process.env.NODE_ENV === 'production'

// input/output file path config
let paths = {
  input: {
    views: 'src/views',
    viewLayouts: 'src/views/layouts',
    viewPartials: 'src/views/partials',

    scriptPath: 'src/assets/js',
    stylePath: 'src/assets/scss',

    static: 'src/assets/static',
  },
  output: {
    dist: 'dist',
    views: '',
    viewAssets: 'assets',
    images: 'assets/images',

    static: 'dist/assets/static',

    // file orders matter, so have to put a plain array here
    globalStyles: [
      '/assets/static/vendor/bootstrap/css/bootstrap-reboot.min.css',
      '/assets/static/vendor/bootstrap/css/bootstrap-grid.min.css',
      '/assets/static/vendor/fontawesome/css/all.min.css',
    ],
    globalScripts: [
      '/assets/static/vendor/jquery-3.5.1.slim.min.js',
      '/assets/static/vendor/bootstrap/js/bootstrap.bundle.min.js',
    ],
  },
}

if (isProd) {
  // todo: config paths for production environment
}

// entry config for scripts/styles
const entry = {}

//html plugin instances for views
const htmlWebpackPluginInstances = []

;(function prepare () {

  // Register helpers
  handlebars.registerHelper(layouts(handlebars))

  // Register partials
  globby.sync([
    `${paths.input.viewLayouts}/*.hbs`,
    `${paths.input.viewPartials}/*.hbs`,
  ]).forEach(partial => {
    handlebars.registerPartial(path.parse(partial).name, fs.readFileSync(partial, 'utf8'))
  })

  const inputViews = globby.sync([
    `${paths.input.views}/**/*.hbs`,
    `!${paths.input.viewLayouts}/*`,
    `!${paths.input.viewPartials}/*`,
  ])

  inputViews.forEach(inputView => {

    // config assets input/output

    // 'src/views/index.hbs' -> 'index'
    // 'src/views/errors/404.hbs' -> 'errors/404'
    const inputViewAssetsPathSegment = inputView.slice(`${paths.input.views}/`.length, -4)

    // 'src/views/index.hbs' -> 'assets/views/index'
    // 'src/views/errors/404.hbs' -> 'errors/404'
    const outputViewAssetsPath = `${paths.output.viewAssets}/${inputViewAssetsPathSegment}`

    // 'src/views/index.hbs' -> ['./src/assets/js/index.js', './src/assets/scss/index.scss']
    // 'src/views/errors/404.hbs' -> [ './src/assets/js/errors/404.js', './src/assets/scss/errors/404.scss']
    const inputScriptPath = `./${paths.input.scriptPath}/${inputViewAssetsPathSegment}.js`
    const outputStylePath = `./${paths.input.stylePath}/${inputViewAssetsPathSegment}.scss`

    // keyed entry points
    // views {
    //   'assets/views/index': [ './src/assets/js/index.js', './src/assets/scss/index.scss' ],
    //     'assets/views/errors/404': [
    //     './src/assets/js/errors/404.js',
    //     './src/assets/scss/errors/404.scss'
    //   ]
    // }
    entry[outputViewAssetsPath] = [inputScriptPath, outputStylePath]

    // config view input/output

    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: 'src/views/index.hbs',
    //   chunks: ['assets/index'],
    //   hash: true,
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'errors/404.html',
    //   template: 'src/views/errors/404/404.hbs',
    //   chunks: ['404'],
    //   hash: true
    // })
    htmlWebpackPluginInstances.push(new HtmlWebpackPlugin({
      filename: `${inputViewAssetsPathSegment}.html`,
      template: inputView,
      chunks: [outputViewAssetsPath],
      hash: true,
    }))
  })

  console.log('entry: ', entry)

})()

module.exports = {
  entry,
  output: {
    path: path.resolve(__dirname + '/dist'),
    publicPath: '/',
    pathinfo: false,
  },
  stats: 'minimal',
  module: {
    rules: [{
      test: /\.hbs$/i,
      loader: 'html-loader',
      options: {
        preprocessor: (content, loaderContext) => {
          let result

          try {
            result = handlebars.compile(content)({
              globalStyles: paths.output.globalStyles,
              globalScripts: paths.output.globalScripts,
              isProd,
            })
          } catch (error) {
            loaderContext.emitError(error)

            return content
          }

          return result
        },
      },
    },
      {
        test: /\.css$/i,
        loader: 'css-loader',
      },
      {
        test: /\.scss$/i,
        use: [{
          loader: 'vue-style-loader',
          options: {
            sourceMap: true,
          },
        },

          MiniCssExtractPlugin.loader,

          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: function () {
                return [require('autoprefixer')]
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'url-loader', // fallback to file-loader
          options: {
            limit: 8192, // 8k
            outputPath: paths.output.images,
          },
        }],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [

    new CleanWebpackPlugin(),

    new FileManagerWebpackPlugin({
      onStart: [
        {
          copy: [
            {
              source: paths.input.static,
              destination: paths.output.static,
            },
          ],
        },
      ],
    }),

    // todo: make this copy only when vendorAssets file changes
    // then use this instead of FileManagerWebpackPlugin
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: paths.input.vendorAssets,
    //       to: paths.output.vendorAssets,
    //       globOptions: {
    //         ignore: ['**/.*'],
    //       },
    //       cacheTransform: true,
    //     },
    //   ],
    // }),

    new ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      ppo: 'ppo',
      _: 'lodash',
    }),

    ...htmlWebpackPluginInstances,

    new MiniCssExtractPlugin(),

    new VueLoaderPlugin(),
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, 'src'),
    },
  },
}
