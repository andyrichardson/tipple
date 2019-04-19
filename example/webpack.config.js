const Dotenv = require('dotenv-webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/index.tsx'),
  mode: 'development',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /\.*node_modules\/*/,
        use: [
          {
            loader: require.resolve('awesome-typescript-loader'),
            options: {
              configFileName: require.resolve('./tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve('style-loader'),
          },
          {
            loader: require.resolve('css-loader'),
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, '../node_modules/react'),
      // 'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  plugins: [new HTMLWebpackPlugin(), new Dotenv({ systemvars: true })],
  output: {
    path: path.resolve(__dirname, '.build'),
    filename: 'bundle.js',
    publicPath: '/assets/',
  },
  devtool: 'eval-source-map',
  devServer: {
    allowedHosts: ['localhost', '172.0.0.1', 'web'],
    host: '0.0.0.0',
    port: 3000,
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    https: false,
    noInfo: true,
  },
};
