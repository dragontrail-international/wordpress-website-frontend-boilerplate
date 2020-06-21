const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    // hot: true, // 启用后视图变化时页面不刷新
    overlay: {
      warnings: true,
      errors: true,
    },
  },
})
