const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    //hot: true,
    //contentBase: path.join(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: path.join(__dirname, 'index.html')
    })
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
        },
        exclude: [/node_modules/]
      },
    ]
  }
};
