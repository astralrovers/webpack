const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const happypack = require('happypack');

module.exports = {
    devServer: {
        port: 8080,
        progress: true,
        contentBase:'./dist',
        open: true,
    },
    entry: {
        index: './src/index.js',
        home: './src/home.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['index'],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'home.html',
            chunks: ['index', 'home']
        }),
        new MiniCssExtractPlugin({
            filename:'main.css'
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {from:'./README.md', to:'./'}
        ]),
        new webpack.BannerPlugin('make 2019 by astralrovers'),
        new webpack.IgnorePlugin(/\.\/locale/, /moment/), // 忽略那个插件的哪个目录
    ],
    module: {
        noParse: /jquery/,
        rules: [
            {
                test: /\.html$/,
                use: 'html-withimg-loader'
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 200 * 1024,
                        outputPath: 'img',
                    }
                }
            },
            {
                test:/\.js$/,
                exclude: /node_modules/, // 排除这个文件夹
                include: path.resolve('src'), // 包含这个文件夹，和上边的选项一个就够了
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            { 
                test: /\.css$/,
                use: [
                   MiniCssExtractPlugin.loader,
                    'css-loader']
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,                   
                    'css-loader',
                    'less-loader'
                ]
            }
        ]
    }
};