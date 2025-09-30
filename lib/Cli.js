const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const {welcomeText} = require('./constance')
const printer = require('@darkobits/lolcatjs');
const readline = require('readline');

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
    const templateDir = path.join(__dirname, '../template');
    const templates = [];
    
    try {
      if (fs.existsSync(templateDir)) {
        const templateFolders = fs.readdirSync(templateDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        templateFolders.forEach(templateName => {
          const templatePath = path.join(templateDir, templateName);
          const packageJsonPath = path.join(templatePath, 'package.json');
          
          let description = `${templateName} 项目模板`;
          let color = 'blue';
          
          // 尝试读取 package.json 获取描述信息
          if (fs.existsSync(packageJsonPath)) {
            try {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              if (packageJson.description) {
                description = packageJson.description;
              }
              
              // 根据模板类型设置颜色
              if (templateName.includes('react')) {
                color = 'blue';
              } else if (templateName.includes('vue')) {
                color = 'green';
              } else if (templateName.includes('vanilla')) {
                color = 'yellow';
              } else if (templateName.includes('ts')) {
                color = 'cyan';
              }
            } catch (error) {
              console.warn(chalk.yellow(`⚠️  无法读取模板 ${templateName} 的 package.json`));
            }
          }
          
          templates.push({
            name: templateName,
            description: description,
            color: color,
            path: templatePath
          });
        });
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  读取模板目录失败: ${error.message}`));
    }
    
    return templates;
  }

  /**
   * 显示可用模板
   */
  showAvailableTemplates() {
    const templates = this.getAvailableTemplates();
    
    console.log(chalk.cyan.bold('\n📋 可用的项目模板：'));
    templates.forEach((template, index) => {
      console.log(
        `  ${chalk[template.color]('●')} ${chalk.bold(template.name)} - ${template.description}`
      );
    });
    console.log('');
  }

  /**
   * 交互式选择模板
   * @returns {Promise<string>} 选择的模板名称
   */
  async selectTemplate() {
    const templates = this.getAvailableTemplates();
    
    if (templates.length === 0) {
      console.log(chalk.red('❌ 没有找到可用的模板'));
      return null;
    }
    
    if (templates.length === 1) {
      console.log(chalk.cyan(`📋 使用唯一可用模板: ${chalk.bold(templates[0].name)}`));
      return templates[0].name;
    }
    
    this.showAvailableTemplates();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      const askTemplate = () => {
        rl.question(chalk.cyan('请选择模板 (输入模板名称): '), (answer) => {
          const selectedTemplate = templates.find(t => 
            t.name.toLowerCase() === answer.toLowerCase().trim()
          );
          
          if (selectedTemplate) {
            rl.close();
            resolve(selectedTemplate.name);
          } else {
            console.log(chalk.red(`❌ 模板 '${answer}' 不存在，请重新选择`));
            askTemplate();
          }
        });
      };
      
      askTemplate();
    });
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
   * 复制目录及其内容
   * @param {string} src - 源目录
   * @param {string} dest - 目标目录
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        // 跳过 node_modules 目录
        if (entry.name === 'node_modules') {
          continue;
        }
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * 更新项目名称和描述
   * @param {string} projectPath - 项目路径
   * @param {string} projectName - 项目名称
   */
  updateProjectInfo(projectPath, projectName) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.name = projectName;
        packageJson.description = `${projectName} 项目`;
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  无法更新 package.json: ${error.message}`));
      }
    }
  }

  /**
   * 创建项目
   * @param {string} projectName - 项目名称
   * @param {string} template - 模板名称（可选，如果不提供则交互式选择）
   */
  async createProject(projectName, template = null) {
    // 验证项目名称
    if (!this.validateProjectName(projectName)) {
      return;
    }

    // 如果没有指定模板，则交互式选择
    if (!template) {
      template = await this.selectTemplate();
      if (!template) {
        return;
      }
    }

    // 验证模板
    if (!this.validateTemplate(template)) {
      return;
    }

    console.log(chalk.cyan(`\n🚀 开始创建项目: ${chalk.bold(projectName)}`));
    console.log(chalk.gray(`📋 使用模板: ${template}`));
    
    try {
      const templates = this.getAvailableTemplates();
      const selectedTemplate = templates.find(t => t.name === template);
      
      if (!selectedTemplate) {
        throw new Error(`模板 ${template} 不存在`);
      }
      
      const projectPath = path.resolve(process.cwd(), projectName);
      
      console.log(chalk.yellow('📁 正在复制模板文件...'));
      this.copyDirectory(selectedTemplate.path, projectPath);
      
      console.log(chalk.yellow('📝 正在更新项目信息...'));
      this.updateProjectInfo(projectPath, projectName);
      
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