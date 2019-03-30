const path = require('path');

module.exports = {
    mode: 'development', // 模式 默认两种production 和 development
    entry: './src/index.js', // 入口
    output: { // 出口
        filename: 'bundle.js', // 生成的文件名
        path: path.resolve(__dirname, 'dist') // 路径，必须是一个局对路径
    }
};