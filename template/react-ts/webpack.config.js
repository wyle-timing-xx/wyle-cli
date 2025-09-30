const path = require("path");
const webpack = require("webpack");
const {merge} = require('webpack-merge');
const parser = require('yargs-parser')
const argv = parser(process.argv.slice(2));
const baseConfig = require('./config/webpack.config.base')
const devConfig = require('./config/webpack.config.dev')
const prodConfig = require('./config/webpack.config.prod')
const mode = argv.mode;
console.log("当前webpack环境===>", mode);
const modeArr = ["development", "production" /*, 'none'*/] // 不处理none的情况
if (!modeArr.includes(mode)) {
  throw new Error("mode 不合法")
}
let webpackConfig = null;
const isDev = mode === "development"
const isProd = mode === "production"
if (isDev) {
  webpackConfig = devConfig;
}

if (isProd) {
  webpackConfig = prodConfig;
}
if (!webpackConfig) {
  throw new Error("webpackConfig 不合法")
}
const lastWebpackConfig = merge(baseConfig, webpackConfig)
module.exports = lastWebpackConfig
