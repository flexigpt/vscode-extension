const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx', // Your library's entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack.[name].bundle.js',
    publicPath: '/'
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, '../../packages/'),
      process: 'process/browser.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors'
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          enforce: true
        }
      }
    }
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'public/icons', to: 'icons' }]
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js'
    }),
    new MiniCssExtractPlugin({
      filename: 'webpack.[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'head'
    })
  ]
};
