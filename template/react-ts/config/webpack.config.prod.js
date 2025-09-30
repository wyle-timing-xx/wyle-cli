const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Webpack 生产环境配置
 * 专注于性能优化、代码压缩、缓存策略等生产环境特性
 */
module.exports = {
  // 生产模式 - 启用各种优化
  mode: "production",

  // 生产环境源码映射 - 生成 main.js.map 文件（包含完整源码映射）, 用户看不到源码，但 source map 文件存在
  devtool: "hidden-source-map", // 生成独立的 .map 文件，便于错误追踪

  // 生产环境输出配置
  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/", // CDN 部署时可改为 CDN 地址
    clean: true, // 构建前清理输出目录
    // 文件名包含内容哈希，便于缓存策略
    filename: "static/js/[name].[contenthash:8].js",
    chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    assetModuleFilename: "static/media/[name].[hash:8][ext]",
    // 生产环境优化
    pathinfo: false, // 不包含路径信息，减小包体积
    // 跨域加载资源配置
    crossOriginLoading: "anonymous",
  },

  // 生产环境插件配置
  plugins: [
    // 环境变量定义
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      __DEV__: false,
      __PROD__: true,
      // 可以添加更多环境变量
      "process.env.REACT_APP_VERSION": JSON.stringify(process.env.npm_package_version),
    }),
    new HtmlWebpackPlugin({
      template: './public/index-prod.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,                // 移除注释
        collapseWhitespace: true,           // 压缩空白字符
        removeAttributeQuotes: true,        // 移除属性引号
        removeRedundantAttributes: true,    // 移除冗余属性
        useShortDoctype: true,              // 使用短的 doctype
        removeEmptyAttributes: true,        // 移除空属性
        removeScriptTypeAttributes: true,   // 移除 script 的 type 属性
        removeStyleLinkTypeAttributes: true,// 移除 style 和 link 的 type 属性
        minifyJS: true,                     // 压缩内联 JS
        minifyCSS: true,                    // 压缩内联 CSS
      },
      // 生产环境特定配置
      cache: true,                          // 启用缓存
      showErrors: false,                    // 不显示错误信息到页面
      // 可以传递自定义变量到模板
      templateParameters: {
        title: 'React App - Production',
        description: 'React application in production mode',
        NODE_ENV: 'production',
        useCDN: true,
        reactCDN: 'https://unpkg.com/umd-react@19.1.0/dist/react.production.min.js',
        reactDOMCDN: 'https://unpkg.com/umd-react@19.1.0/dist/react-dom.production.min.js',
      }
    }),
    // CSS 提取和优化
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css",
      chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
      // 忽略冲突的顺序警告（通常不影响功能）
      ignoreOrder: true,
    }),

    // Gzip 压缩
    new CompressionPlugin({
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 8192, // 只压缩大于 8KB 的文件
      minRatio: 0.8, // 压缩率小于 80% 才压缩
      deleteOriginalAssets: false, // 保留原文件
    }),

    // Brotli 压缩（更好的压缩率）
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [require("zlib").constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 8192,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),


    // 包大小分析（可选，用于分析打包结果）
    ...(process.env.ANALYZE ? [
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "bundle-report.html",
      })
    ] : []),

    // 模块联邦插件（如果需要微前端）
    // new webpack.container.ModuleFederationPlugin({
    //   name: "shell",
    //   remotes: {},
    //   shared: {
    //     react: { singleton: true },
    //     "react-dom": { singleton: true },
    //   },
    // }),

    // 忽略插件（减少不必要的依赖）
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ].filter(Boolean),

  // 生产环境优化配置
  optimization: {
    // 启用压缩
    minimize: true,
    minimizer: [
      // JavaScript 压缩
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true, // 移除 console
            drop_debugger: true, // 移除 debugger
            pure_funcs: ["console.log", "console.info"], // 移除特定函数调用
          },
          mangle: {
            safari10: true,
          },
          format: {
            ecma: 5,
            comments: false, // 移除注释
            ascii_only: true,
          },
        },
        parallel: true, // 并行压缩
        extractComments: false, // 不提取注释到单独文件
      }),

      // CSS 压缩
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true }, // 移除所有注释
              normalizeWhitespace: true, // 标准化空白字符
              colormin: true, // 颜色值最小化
              minifySelectors: true, // 选择器最小化
            },
          ],
        },
        parallel: true,
      }),
    ],

    // 代码分割策略
    splitChunks: {
      chunks: "all",
      minSize: 20000, // 最小分割大小
      maxSize: 244000, // 最大分割大小
      cacheGroups: {
        // 默认缓存组
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },

        // 第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: -10,
          chunks: "all",
          enforce: true,
        },

        // React 生态系统
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
          name: "react-vendor",
          priority: 10,
          chunks: "all",
          enforce: true,
        },

        // UI 库（如 antd, material-ui 等）
        ui: {
          test: /[\\/]node_modules[\\/](antd|@ant-design|@mui|@material-ui)[\\/]/,
          name: "ui-vendor",
          priority: 8,
          chunks: "all",
          enforce: true,
        },

        // 工具库
        utils: {
          test: /[\\/]node_modules[\\/](lodash|moment|dayjs|axios|classnames)[\\/]/,
          name: "utils-vendor",
          priority: 7,
          chunks: "all",
          enforce: true,
        },

        // 图标库
        icons: {
          test: /[\\/]node_modules[\\/](@ant-design\/icons|react-icons|heroicons)[\\/]/,
          name: "icons-vendor",
          priority: 6,
          chunks: "all",
          enforce: true,
        },

        // 公共样式
        styles: {
          test: /\.(css|scss|sass|less)$/,
          name: "styles",
          priority: 5,
          chunks: "all",
          enforce: true,
        },
      },
    },

    // 运行时代码分离
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },

    // 模块 ID 生成策略
    moduleIds: "deterministic", // 确定性 ID，有利于缓存
    chunkIds: "deterministic",

    // Tree Shaking 配置
    usedExports: true,
    sideEffects: false, // 标记为无副作用，启用更激进的 tree shaking

    // 合并重复模块
    mergeDuplicateChunks: true,

    // 移除空的 chunks
    removeEmptyChunks: true,

    // 标记未使用的模块
    flagIncludedChunks: true,

    // 内联 webpack 运行时
    innerGraph: true,

    // 实际使用的导出
    realContentHash: true,
  },

  // 模块配置（生产环境特定）
  module: {
    rules: [
      // TypeScript/JavaScript 处理
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
                decorators: true,
                dynamicImport: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                  development: false, // 生产模式
                  refresh: false, // 生产环境不需要热刷新
                },
              },
              target: "es2020",
              loose: false,
              externalHelpers: false,
            },
            minify: true, // 启用 SWC 压缩
            module: {
              type: "es6",
            },
            sourceMaps: true,
          },
        },
      },
    ],
  },

  // 外部化依赖（CDN 加载）
  externals: [
    {
      // 如果使用 CDN 加载这些库，可以配置为外部依赖
      react: "React",
    },
    // 处理 react-dom 的子模块, 在react 19 中, 会有 client 和 server 两个 react-dom包, 我们需要灵活的去处理它们
    function({ request }, callback) {
      if (/^react-dom\//.test(request)) {
        return callback(null, 'ReactDOM');
      }
      callback();
    },
  ],

  // 解析配置
  resolve: {
    // 生产环境可以移除一些不必要的扩展名以提升解析速度
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    // 优化模块解析
    symlinks: false,
    cacheWithContext: false,
  },

  // 性能提示配置
  performance: {
    hints: "warning", // 显示性能警告
    maxEntrypointSize: 512000, // 入口点最大大小 500KB
    maxAssetSize: 512000, // 单个资源最大大小 500KB
    assetFilter: function(assetFilename) {
      // 只对 JS 和 CSS 文件进行性能检查
      return assetFilename.endsWith(".js") || assetFilename.endsWith(".css");
    },
  },

  // 统计信息配置
  stats: {
    preset: "normal",
    colors: true,
    hash: true,
    timings: true,
    chunks: false,
    chunkModules: false,
    children: false,
    modules: false,
    reasons: false,
    source: false,
    errors: true,
    errorDetails: true,
    warnings: true,
    publicPath: false,
    builtAt: true,
    // 显示打包大小信息
    assets: true,
    assetsSort: "size",
    // 过滤掉小文件
    excludeAssets: [
      /\.(png|jpe?g|gif|svg)$/,
      /\.(woff|woff2|eot|ttf|otf)$/,
    ],
  },

  // 缓存配置
  cache: {
    type: "filesystem",
    version: "1.0",
    cacheDirectory: path.resolve(__dirname, "../node_modules/.cache/webpack"),
    buildDependencies: {
      config: [__filename],
    },
    // 缓存内容哈希
    hashAlgorithm: "xxhash64",
  },

  // 基础设施日志配置
  infrastructureLogging: {
    level: "error", // 只显示错误日志
    debug: false,
  },

  // 目标环境
  target: ["web", "es2020"],

  // 实验性功能
  experiments: {
    // 异步 WebAssembly
    asyncWebAssembly: false,
    
    // 向后兼容性
    backCompat: true,
    
    
    // 缓存未受影响的模块
    cacheUnaffected: true,
    
    // CSS 作为模块类型
    css: false,
    
    // 延迟导入
    deferImport: false,
    
    // 未来默认值
    futureDefaults: false,
    
    // 分层构建
    layers: false,
    
    // 懒编译
    lazyCompilation: false,
    
    // ES 模块输出
    outputModule: false,
    
    // 同步 WebAssembly
    syncWebAssembly: false,
    
    // 顶层 await
    topLevelAwait: true,
  },

  // 监听配置（通常生产环境不需要）
  watch: false,
};