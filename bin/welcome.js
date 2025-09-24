const chalk = require('chalk');
const printer = require('@darkobits/lolcatjs');
const pkg = require('../package.json');
const { welcomeText } = require('./constance')

function welcomeFn() {
	console.log(printer.fromString(welcomeText));
	console.log(chalk.cyan.bold(`🚀 Wyle CLI v${pkg.version}`));
	console.log(chalk.gray('现代化前端项目脚手架工具\n'));
}

module.exports = {
	welcomeFn
}