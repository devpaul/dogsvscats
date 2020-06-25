const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { join } = require('path')
const { WebpackConfigDumpPlugin } = require("webpack-config-dump-plugin");

console.log('HELLO')

const tsconfigPath = join(__dirname, 'tsconfig.json')

module.exports = {
	module: {
		rules: [
			{
				test: /\.(m?js|ts)?$/,
				use: {
					loader: "ts-loader",
					options: {
						configFile: tsconfigPath
					}
				}
			}
		]
	},
	plugins: [new WebpackConfigDumpPlugin({ depth: 12 })],
	resolve: {
		plugins: [new TsconfigPathsPlugin({
			configFile: tsconfigPath,
			logLevel: 'info',
			logInfoToStdOut: true
		})]
	}
}
