const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { port, host } = require('./webpack.tool');
/**
 * Webpack 开发环境配置
 * 注意：这里不再需要 merge，因为合并操作在主配置文件中完成
 */
module.exports = {
  mode: 'development',

  // 开发环境源码映射 - 平衡构建速度和调试体验
  devtool: 'eval-cheap-module-source-map',

  // 开发服务器配置
  devServer: {
    static: [
      {
        directory: path.join(__dirname, '../public'),
        publicPath: '/',
      },
    ],
    port,
    host,
    historyApiFallback: {
      // SPA 路由支持
      disableDotRule: true,
      index: '/index.html',
    },
    compress: true, // 启用 gzip 压缩
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const { port: serverPort, host: serverHost } = devServer.options;

      console.log(`🚀 开发服务器已启动:`);
      console.log(`   🌐 地址: http://${serverHost}:${serverPort}`);
      console.log(`   ⚡ 热重载已启用`);
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
      reconnect: 3,
    },
    // 开发服务器中间件配置
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // 自定义中间件可以在这里添加
      middlewares.unshift({
        name: 'custom-headers',
        middleware: (req, res, next) => {
          res.setHeader('X-Custom-Header', 'development');
          next();
        },
      });

      return middlewares;
    },
    // 监听文件变化
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
        aggregateTimeout: 300,
      },
    },
    // HTTPS 配置（如果需要）
    // https: true,
  },

  // 输出配置（开发环境）
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name][ext]',
    pathinfo: false, // 提升构建性能
  },

  // 开发环境插件
  plugins: [
    // 定义环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __DEV__: true,
      __PROD__: false,
    }),
    new HtmlWebpackPlugin({
      template: './public/index-dev.html',
      filename: 'index.html',
      inject: 'body',
      // 开发环境不压缩，便于调试
      minify: false,
      // 开发环境特定配置
      cache: false, // 关闭缓存，确保实时更新
      showErrors: true, // 显示错误信息到页面
      // 传递开发环境变量
      templateParameters: {
        title: 'React App - Development',
        description: 'React application in development mode',
        NODE_ENV: 'development',
        useCDN: false,
        // 开发环境提示信息
        devMode: true,
      },
    }),
    // 确保 ReactRefreshWebpackPlugin 在插件列表中
    new ReactRefreshWebpackPlugin(),
    // 进度插件
    new webpack.ProgressPlugin({
      activeModules: false,
      entries: true,
      handler(percentage, message, ...args) {
        // 自定义进度输出
        if (percentage === 1) {
          console.log('✅ Webpack compilation completed successfully!');
        }
      },
      modules: true,
      modulesCount: 5000,
      profile: false,
      dependencies: true,
      dependenciesCount: 10000,
      percentBy: null,
    }),
    // CSS 提取插件
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: 'static/css/[name].chunk.css',
    }),
  ].filter(Boolean),

  // 开发环境优化配置
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false, // 开发环境不需要代码分割，加快构建速度
    minimize: false, // 开发环境不压缩代码
    usedExports: false,
    sideEffects: false,
    // 开发环境下保持模块名称便于调试
    chunkIds: 'named',
    moduleIds: 'named',
  },

  // 统计信息配置
  stats: {
    preset: 'minimal', // 基础最小化输出
    colors: true, // 彩色输出，便于阅读
    errorDetails: true, // 显示错误详情，开发时重要
    builtAt: true, // 显示构建时间
    timings: true, // 显示各阶段耗时，性能调试有用
    modules: false, // 不显示模块列表，减少噪音
    assets: false, // 不显示资源列表
    children: false, // 不显示子编译信息
    chunks: false, // 不显示 chunk 信息
    hash: false, // 不显示构建哈希
    version: false, // 不显示 webpack 版本
    entrypoints: false, // 不显示入口点信息
    // 可以考虑添加的选项
    warnings: true, // 显示警告信息
    warningsFilter: [
      // 过滤某些警告
      /Critical dependency/,
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
                decorators: true,
                dynamicImport: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: true, // 开发模式
                  refresh: true, // 启用 Fast Refresh
                },
              },
              target: 'es2020',
            },
            module: {
              type: 'es6',
            },
            sourceMaps: true,
          },
        },
      },
    ],
  },
  // 监听配置
  watchOptions: {
    aggregateTimeout: 200,
    poll: false,
    ignored: /node_modules/,
  },

  // 开发环境下的实验性功能
  experiments: {
    lazyCompilation: {
      // 启用懒编译以提升开发体验
      entries: false,
      imports: true,
    },
    // 缓存编译结果
    cacheUnaffected: true,
  },

  // 性能提示配置（开发环境关闭）
  performance: {
    hints: false,
  },

  // 基础设施日志配置
  infrastructureLogging: {
    level: 'warn',
  },

  // 目标环境
  target: 'web',
};
