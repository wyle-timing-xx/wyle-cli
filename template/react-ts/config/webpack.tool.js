const port = process.env.PORT || 3000;
const host = 'localhost';

// 在模块加载时输出配置信息
console.log(`📋 Webpack 开发配置:`);
console.log(`   🎯 目标端口: ${port}`);
console.log(`   🏠 主机地址: ${host}`);
console.log(`   🔧 环境变量 PORT: ${process.env.PORT || '未设置'}`);

module.exports = {
  port,
  host,
};
