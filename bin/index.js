#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');
const { welcomeFn } = require('./welcome');
const {pkgDefaultName} = require('./constance')
welcomeFn()
program
  .name(pkg.name || pkgDefaultName)
  .description(pkg.description)
  .version(pkg.version, '-v, --version', '显示版本号');


// 创建项目的主命令（暂时是占位符）
program
  .command('create <project-name>')
  .description('创建一个新的前端项目')
  .option('-t, --template <template>', '选择项目模板', 'vue')
  .action((projectName, options) => {
    console.log(chalk.blue(`🎯 准备创建项目: ${projectName}`));
    console.log(chalk.gray(`📋 使用模板: ${options.template}`));
    console.log(chalk.yellow('🚧 功能开发中...'));
  });

// 解析命令行参数
program.parse();

// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}