const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development', // 模式 默认两种production 和 development
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
    devServer: { // 开发服务器配置
        port: 8080, // 端口
        progress: true,
        contentBase:'./dist', // 默认执行目录
        open: true, // 自动打开浏览器
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:3000', // 目标域名
        //         pathRewrite: {
        //             '/api':'' // 替换路径，把webpack-server访问的路径里面的/api替换为空，只要后面的路径
        //                         // http://localhost:8080/api/user/ ==> http://localhost:3000/user/
        //         }
        //     }
        // }
        // before(app) {
        //     app.get('/user', (req, res) => {
        //         res.end('hello');
        //     });
        // }
    },
    // entry: './src/index.js', // 入口
    entry: {
        index: './src/index.js',
        home: './src/home.js'
    },
    // 源码映射，会单独生成一个sourcemap文件，出错了会标识当前报错的行和列
    // devtool: 'eval-source-map', // 不会产生单独的文件，但是可以显示行和列
    // devtool: 'cheap--source-map', // 
    devtool: 'source-map', // 增加映射文件，帮助调试代码
    //watch: true,
    watchOptions: {
        poll: 1000, // 单位是毫秒，即每秒一次
        // 当第一个文件更改，会在重新构建前增加延迟。
        aggregateTimeout: 500,// 防抖 比如一直输入代码，
        ignored: /node_modules/  // 这个文件不需要监控
    },
    output: { // 出口
        // //filename: 'bundle.[hash:8].js', // 生成的文件名 [hash]表示加hash值(只要8位)，配合后面的plugin使用
        // filename: 'bundle.js',
        // path: path.resolve(__dirname, 'dist'), // 路径，必须是一个局对路径
        // // publicPath: './' // 自动在静态文件名前面加路径，这样就不会引用错了，一般是绝对路径:http:xxx.com/
        filename: '[name].js', // 这里的name就表示index和home，会单独生成两个文件
        path: path.resolve(__dirname, 'dist')
    },
    plugins:[ // 数组，放着所有插件，每个都是一个插件实例
        // new webpack.DefinePlugin({
        //     MY_ENV: "test_mode"
        // }),
        new HtmlWebpackPlugin({
            template: './src/index.html', // 模板文件
            filename: 'index.html', // 输出文件名，会放在前面配置的出口路径下
            chunks: ['index'] // 把前面的分页打包index.js插入到index.html中,home.js不要
            /*
            minify: { // 压缩html文件
                removeAttributeQuotes: true, // 删除html里面属性的双引号
                collapseWhitespace: true, // 合并成一行
                hash: true // 增加hash戳
            }
            */
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'home.html',
            chunks: ['index', 'home']
        }),
        new MiniCssExtractPlugin({
            filename:'main.css' // 输出的css文件名
        }),
        new CleanWebpackPlugin(), // 自动识别输出目录
        new CopyWebpackPlugin([ // 一个数组
            {from:'./README.md', to:'./'}
        ]),
        new webpack.BannerPlugin('make 2019 by astralrovers'), // 给每个文件加注释，不过只有js和css文件有
    ],
    module: { // 模块
        rules: [ // 模块解析规则
            {
                test: /\.html$/,
                use: 'html-withimg-loader'
            },
            {
                test: /\.(jpg|png|gif)$/,
                // use:'file-loader'
                // 当图片小于200k时把图片打包成base64编码，否则使用file-loader来产生一张真实存在的图片
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 200 * 1024,
                        outputPath: 'img', // 存放到img目录下,并且最后的图片路径会自动加上路径
                        // publicPath: 'http://loacol.com/' // 可以单独为图片加路径
                    }
                }
            },
            {
                test:/\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: { // 用babel-loader 把es6转化为es5
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            // loader的特点是功能单一，所以一般需要好几个，可以是数组，可以是对象，对象可以有更多参数
            // loader是有顺序的，默认从右向左执行(所以需要注意)
            // css-loader是用来处理@import这种语法的
            // style-loader是用来把css插入到head标签里面的，但是我们看打包好的`index.html`里面并没有引入css，因为css被放到
            // bundle.js里面了，不过浏览器样式里面是有的。
            { 
                test: /\.css$/,
                use: [
                    /*
                    {
                        loader: 'style-loader',
                        options: {
                            inserttAt: 'top' // 因为我们在html里面有可能定义style，这里的话是把模块里的样式放到html的样式前面，这样一来
                        }
                    },
                    */
                   MiniCssExtractPlugin.loader, // 这里的话就不要插入到style标签离了，而是使用MiniCssExtractPlugin的loader规则，也就是使用link
                    'css-loader']
            },
            {
                test: /\.less$/, // less sass 等等都一样
                use: [
                    /*
                    {
                        loader: 'style-loader',
                        options: {
                            inserttAt: 'top' // 因为我们在html里面有可能定义style，这里的话是把模块里的样式放到html的样式前面，这样一来
                        }
                    },
                    */
                    MiniCssExtractPlugin.loader, // 这里的话就不要插入到style标签离了，而是使用MiniCssExtractPlugin的loader规则，也就是使用link                   
                    'css-loader',
                    'less-loader'
                ]
            }
        ]
    }
};