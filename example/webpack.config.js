const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

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
  plugins: [new HTMLWebpackPlugin()],
  output: {
    path: path.resolve(__dirname, '.build'),
    filename: 'bundle.js',
    publicPath: '/assets/',
  },
  devtool: 'eval-source-map',
  devServer: {
    allowedHosts: ['app'],
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
