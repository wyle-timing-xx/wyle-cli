const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const {welcomeText} = require('./constance')
const printer = require('@darkobits/lolcatjs');

/**
 * CLI 主类
 */
class WyleCLI {
  constructor() {
		const pkg = require('../package.json')
		this.pkg = pkg
    this.version = pkg.version;
  }
	welcomeFn() {
		console.log(printer.fromString(welcomeText));
		console.log(chalk.cyan.bold(`🚀 v${this.pkg.version}`));
		console.log(chalk.gray(`${this.pkg.description}\n`));
	}
  /**
   * 检查项目名称是否合法
   * @param {string} projectName - 项目名称
   * @returns {boolean} 是否合法
   */
  validateProjectName(projectName) {
    // 检查是否为空
    if (!projectName || projectName.trim() === '') {
      console.log(chalk.red('❌ 项目名称不能为空'));
      return false;
    }

    // 检查是否包含非法字符
    const validNameRegex = /^[a-zA-Z0-9-_]+$/;
    if (!validNameRegex.test(projectName)) {
      console.log(chalk.red('❌ 项目名称只能包含字母、数字、连字符和下划线'));
      return false;
    }

    // 检查目录是否已存在
    if (fs.existsSync(path.resolve(process.cwd(), projectName))) {
      console.log(chalk.red(`❌ 目录 ${projectName} 已存在`));
      return false;
    }

    return true;
  }

  /**
   * 获取可用的模板列表
   * @returns {Array} 模板列表
   */
  getAvailableTemplates() {
    // 目前先返回硬编码的模板列表，后面会从实际模板目录读取
    return [
      {
        name: 'vue',
        description: 'Vue 3 + Vite 项目模板',
        color: 'green'
      },
      {
        name: 'react',
        description: 'React 18 + Vite 项目模板', 
        color: 'blue'
      },
      {
        name: 'vanilla',
        description: '原生 JavaScript + Vite 项目模板',
        color: 'yellow'
      }
    ];
  }

  /**
   * 显示可用模板
   */
  showAvailableTemplates() {
    const templates = this.getAvailableTemplates();
    
    console.log(chalk.cyan.bold('\n📋 可用的项目模板：'));
    templates.forEach(template => {
      console.log(
        `  ${chalk[template.color]('●')} ${chalk.bold(template.name)} - ${template.description}`
      );
    });
    console.log('');
  }

  /**
   * 验证模板是否存在
   * @param {string} templateName - 模板名称
   * @returns {boolean} 是否存在
   */
  validateTemplate(templateName) {
    const templates = this.getAvailableTemplates();
    const exists = templates.some(template => template.name === templateName);
    
    if (!exists) {
      console.log(chalk.red(`❌ 模板 '${templateName}' 不存在`));
      this.showAvailableTemplates();
      return false;
    }
    
    return true;
  }

  /**
   * 创建项目（占位符方法）
   * @param {string} projectName - 项目名称
   * @param {string} template - 模板名称
   */
  async createProject(projectName, template = 'vue') {
    // 验证项目名称
    if (!this.validateProjectName(projectName)) {
      return;
    }

    // 验证模板
    if (!this.validateTemplate(template)) {
      return;
    }

    console.log(chalk.cyan(`\n🚀 开始创建项目: ${chalk.bold(projectName)}`));
    console.log(chalk.gray(`📋 使用模板: ${template}`));
    
    try {
      // 这里后面会实现实际的项目创建逻辑
      console.log(chalk.yellow('🚧 正在准备创建项目...'));
      
      // 模拟一些处理时间
      await this.delay(1000);
      
      console.log(chalk.green('✅ 项目创建成功！'));
      console.log(chalk.cyan('\n📖 下一步操作：'));
      console.log(chalk.gray(`  cd ${projectName}`));
      console.log(chalk.gray('  npm install'));
      console.log(chalk.gray('  npm run dev'));
      
    } catch (error) {
      console.log(chalk.red(`❌ 创建项目失败: ${error.message}`));
    }
  }

  /**
   * 工具函数：延迟执行
   * @param {number} ms - 毫秒数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 显示 CLI 信息
   */
  showInfo() {
		console.log(printer.fromString(welcomeText));
    console.log(chalk.cyan.bold('ℹ️  Wyle CLI 信息'));
    console.log(chalk.gray(`version: v${this.version}`));
    console.log(chalk.gray(`author: ${this.pkg.author}`));
    console.log(chalk.gray(`description: 🚀  ${this.pkg.description}`));
  }
}

module.exports = WyleCLI;