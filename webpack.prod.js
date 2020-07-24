const merge = require('webpack-merge')
const path = require('path')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname + '/dist'), // todo: 生产环境的可能不是这个目录
    // publicPath: '{%$Asset%}',
  },
})
