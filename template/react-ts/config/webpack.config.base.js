const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDev = process.env.NODE_ENV === "development";
module.exports = {
	// 入口文件
	entry: {
		main: "./src/index.tsx",
	},

	// 输出配置
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].[contenthash].js",
		chunkFilename: "[name].[contenthash].chunk.js",
		publicPath: "/",
		clean: true,
	},

	// 模块解析
	resolve: {
		extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@components": path.resolve(__dirname, "src/components"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@styles": path.resolve(__dirname, "src/styles"),
			"@assets": path.resolve(__dirname, "src/assets"),
		},
	},

	// 模块规则
	module: {
		rules: [
			// CSS 处理
			{
				test: /\.css$/,
				exclude: /\.module\.css$/,
				use: [
					isDev ? "style-loader" : MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							importLoaders: 1,
							sourceMap: isDev,
							modules: false, // 不启用 CSS Modules
						},
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: ["autoprefixer", "postcss-preset-env"],
							},
						},
					},
				],
			},

			// CSS Modules 处理
			{
				test: /\.module\.css$/,
				use: [
					isDev ? "style-loader" : MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							importLoaders: 1,
							sourceMap: isDev,
							modules: {
								mode: "local",
								localIdentName: isDev ? "[name]__[local]--[hash:base64:5]" : "[hash:base64:8]",
								exportLocalsConvention: "camelCase", // 驼峰命名转换
								namedExport: false, // 确保使用默认导出
							},
						},
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: ["autoprefixer", "postcss-preset-env"],
							},
						},
					},
				],
			},

			// SCSS/SASS 处理
			{
				test: /\.(scss|sass)$/,
				use: [
					process.env.NODE_ENV === "production" ? MiniCssExtractPlugin.loader : "style-loader",
					{
						loader: "css-loader",
						options: {
							importLoaders: 2,
							sourceMap: true,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: ["autoprefixer", "postcss-preset-env"],
							},
						},
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true,
						},
					},
				],
			},

			// 图片资源处理
			{
				test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
				type: "asset",
				parser: {
					dataUrlCondition: {
						maxSize: 8 * 1024, // 8KB 以下转为 base64
					},
				},
				generator: {
					filename: "images/[name].[hash:8][ext]",
				},
			},

			// 字体文件处理
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
				generator: {
					filename: "fonts/[name].[hash:8][ext]",
				},
			},

			// 其他文件处理
			{
				test: /\.(pdf|doc|docx|xlsx?)$/i,
				type: "asset/resource",
				generator: {
					filename: "files/[name].[hash:8][ext]",
				},
			},
		],
	},

	// 插件配置
	plugins: [
		// 清理输出目录
		new CleanWebpackPlugin(),
	],

	// 优化配置
	optimization: {
		// 代码分割
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				// 第三方库单独打包
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all",
					priority: 10,
				},
				// React 相关库单独打包
				react: {
					test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
					name: "react",
					chunks: "all",
					priority: 20,
				},
				// 公共代码
				common: {
					name: "common",
					minChunks: 2,
					chunks: "all",
					priority: 5,
					reuseExistingChunk: true,
				},
			},
		},
		// 运行时代码单独提取
		runtimeChunk: {
			name: "runtime",
		},
	},

	// 性能提示
	performance: {
		hints: process.env.NODE_ENV === "production" ? "warning" : false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},

	// 基础设施日志配置
	infrastructureLogging: {
		level: "warn",
	},
	// 目标环境
	target: "web",
};
