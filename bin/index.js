#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const lolcatjs = require('@darkobits/lolcatjs');
const pkg = require('../package.json');
const WyleCLI = require('../lib/Cli');

// 创建 CLI 实例
const cli = new WyleCLI();

cli.welcomeFn()
program
  .name('wyle-gen')
  .description(pkg.description)
  .version(pkg.version, '-v, --version', '显示版本号');

// 显示可用模板
program
  .command('list')
  .alias('ls')
  .description('显示所有可用的项目模板')
  .action(() => {
    cli.showAvailableTemplates();
  });

// 创建新项目
program
  .command('create <project-name>')
  .alias('c')
  .description('创建新项目')
  .option('-t, --template <template>', '指定要使用的模板')
  .action(async (projectName, options) => {
    await cli.createProject(projectName, options.template);
  });


// 显示 CLI 详细信息
program
  .command('version')
  .alias('ver')
  .description('显示详细的版本信息')
  .action(() => {
    console.log(chalk.cyan.bold(`🚀 Wyle CLI 详细信息`));
    console.log(chalk.gray(`版本: v${pkg.version}`));
    console.log(chalk.gray(`作者: ${pkg.author}`));
    console.log(chalk.gray(`描述: ${pkg.description}`));
    console.log(chalk.gray(`许可证: ${pkg.license}`));
    console.log(chalk.gray(`Node.js 版本: ${process.version}`));
    console.log(chalk.gray(`平台: ${process.platform} ${process.arch}`));
    
    // 显示依赖版本
    console.log(chalk.cyan('\n📦 主要依赖:'));
    Object.entries(pkg.dependencies).forEach(([name, version]) => {
      console.log(chalk.gray(`  ${name}: ${version}`));
    });
  });

// 解析命令行参数
program.parse();

// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}