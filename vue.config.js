const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const Analyzer = require('webpack-bundle-analyzer')
const argv = require('yargs').argv
console.log('current env is:' + argv.env)
const configName = argv.env || 'dev'

function resolve (dir) {
  return path.resolve(__dirname, dir)
}

module.exports = {
  publicPath: './',
  productionSourceMap: process.env.NODE_ENV !== 'production', // 去掉webpack源文件
  configureWebpack: config => {
    const plugins = []
    plugins.push(
      new CopyWebpackPlugin([
        {
          from: resolve(`./config/${configName}.js`),
          to: resolve('./dist/config.js'),
          toType: 'file'
        }
      ])
    )
    // 生产环境去掉一些debugger,console
    if (process.env.NODE_ENV === 'production') {
      plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            warnings: false,
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log']
            },
            sourceMap: false
          }
        })
      )
    }
    // report统计
    if (process.env.NODE_ENV === 'report') {
      plugins.push(
        new Analyzer.BundleAnalyzerPlugin()
      )
    }
    config.plugins = [
      ...plugins,
      ...config.plugins
    ]
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .end()
    config.resolve.extensions
      .add('.scss')
      .add('.vue')
      .end()
  }
}
