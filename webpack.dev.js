const path = require('path');
const base = require('./webpack.base');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
  mode: 'development',
  resolve: {
    modules: ['modules'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
});
