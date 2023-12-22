const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/app.tsx', // Your library's entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack.main.bundle.js'
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
      '@': path.resolve(__dirname, '../../packages/reactui'),
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
        // use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors'
  //       },
  //       styles: {
  //         name: 'styles',
  //         test: /\.css$/,
  //         enforce: true
  //       }
  //     }
  //   }
  // },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser.js'
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html.tmpl',
      inject: true,
      templateParameters: {
        VSCodeOnly: process.env.vscode === 'true' ? true : false,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public/icons', to: 'icons' }]
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new MiniCssExtractPlugin({
      filename: 'webpack.[name].css',
      chunkFilename: '[id].css'
    }),
    new Dotenv(),
  ]
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map';
} else {
  module.exports.devtool = 'inline-source-map';
}