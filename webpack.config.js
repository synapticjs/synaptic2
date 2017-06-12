var webpack = require('webpack')
var path = require('path')
var BabiliPlugin = require("babili-webpack-plugin")
module.exports = {
  context: __dirname,
  entry: './src/index.ts',
  output: {
    path: path.resolve('dist'),
    filename: 'synaptic.js',
    libraryTarget: 'umd',
    library: 'synaptic',
    publicPath: '/',
  },
  externals: {
    "binaryen": "Binaryen"
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ].concat(process.env.NODE_ENV === 'production' ? [
    new BabiliPlugin({})
  ] : []),
  resolve: {
    extensions: ['', '.js', '.ts', '.json'],
    modulesDirectories: ['.', 'node_modules']
  },
  devtool: process.env.NODE_ENV === 'production' ? undefined : 'source-map',
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}
