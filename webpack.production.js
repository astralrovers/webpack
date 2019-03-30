let smart = require("webpack-merge");
let base = require("./webpack.base.js");
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = smart(base, {
    mode: 'production',
    optimization: { // 优化项
        minimizer: [
            new UglifyjsWebpackPlugin({
                cache: true, // 是否缓存
                parallel: true, // 并发，一起压缩多个
                sourceMap: true
            }),
            new OptimizeCssPlugin()
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['index'],
            
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                hash: true
            }
        }),
    ],
    module: { // 模块
        rules: [ // 模块解析规则
            {
                test: /\.html$/,
                use: 'html-withimg-loader'
            }
        ]
    }
});