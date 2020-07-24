const path = require('path')
const fs = require('fs')
const { ProvidePlugin } = require('webpack')
const FileManagerWebpackPlugin = require('filemanager-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const globby = require('globby')
const handlebars = require('handlebars')
const layouts = require('handlebars-layouts')

const isProd = process.env.NODE_ENV === 'production'

// input/output 编译文件路径配置
let paths = {
  input: {
    layouts: 'layouts',
    partials: 'partials',
    static: 'static',
  },
  output: {
    assets: 'assets',
    static: 'dist/static',
  },
}

const entry = {

  // 全局引入的模块
  app: './assets/js/app.js',
}

// 每个页面的 htmlWebpackPlugin 配置
const htmlPluginInstances = []

// 注册 handlebars helpers
handlebars.registerHelper(layouts(handlebars))

// 注册 handlebars partials
globby.sync([
  `${paths.input.layouts}/*.hbs`,
  `${paths.input.partials}/*.hbs`,
]).forEach(partial => {
  handlebars.registerPartial(path.parse(partial).name, fs.readFileSync(partial, 'utf8'))
})

// 从命令行取模块名
const args = process.argv
const pageArg = args.filter(e => e.includes('--page'))
if (pageArg.length > 0) {

  const page = pageArg[0].split('=')[1]

  console.log('单页面编译: ', page)

  entry[page] = `./pages/${page}/index.js`

  htmlPluginInstances.push(
    new HtmlWebpackPlugin({
      filename: `${page}.html`,
      template: `pages/${page}/index.hbs`,
    }),
  )

} else {

  console.log('未传入页面信息, 将编译所有页面')

  const pages = fs.readdirSync('./pages/')

  console.log('所有页面编译: ', pages)

  pages.forEach((page) => {

    entry[page] = `./pages/${page}/index.js`

    htmlPluginInstances.push(
      new HtmlWebpackPlugin({
        filename: `${page}.html`,
        template: `pages/${page}/index.hbs`,
        chunks: ['app', page],
      }),
    )
  })
}

module.exports = {
  entry,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${paths.output.assets}/[name].[contenthash].js`,
    publicPath: '/',
  },
  // stats: 'minimal', // 用的 webpack 5, webpack/webpack-cli 正式发布了再放开这里
  // stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.hbs$/i,
        loader: 'html-loader',
        options: {
          preprocessor: (content, loaderContext) => {
            let result

            try {
              result = handlebars.compile(content, {
                ignoreStandalone: true,

              })({
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
        test: /\.(css|scss)$/i,
        use: [
          {
            loader: 'vue-style-loader',
            options: {
              sourceMap: false,
            },
          },
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: false,
              plugins: [
                require('autoprefixer'),
              ],
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
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
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          // todo: 或考虑直接用 file-loader
          // {
          //   loader: 'file-loader',
          //   options: {
          //     name: '[name].[contenthash].[ext]',
          //     outputPath: paths.output.assets,
          //     // publicPath: '../', // 修改公共路径
          //   },
          // },
          {
            loader: 'url-loader', // auto fallback to file-loader
            options: {
              limit: 8192, // 8k
              name: '[name].[contenthash].[ext]',
              outputPath: paths.output.assets,
            },
          },
        ],
      },
    ],
  },
  plugins: [

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

    new ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
    }),

    ...htmlPluginInstances,

    new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash].css',
    }),

    new VueLoaderPlugin(),

  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname),
      'assets': path.resolve(__dirname, 'assets'),
    },
  },
}
