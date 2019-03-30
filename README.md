# 学习`webpack`
> 通俗点说就是把源码(js,html,css,图片等)解析打包。

**[别人的学习笔记](https://github.com/mayufo/webpack-training)**

**关于这个学习项目在不同平台上安装时出现的问题**:
`[fsevents@^1.2.7] optional install error: Package require os(darwin) not compatible with your platform(linux)`
解决:
```shell
cnpm rebuild node-sass
cnpm install
```
## 安装
4.x需要安装两个: `webpack` 和 `webpack-cli`
```shell
npm init -fy #首先创建一个项目
cnpm install webpack webpack-cli --save-dev
#--save-dev 表示开发阶段需要，产品阶段不需要，因为他是用来给我们打包用的
```

**如果我们不进行配置的话，其实webpack本身是有一个默认配置的**，默认配置的文件在：
`node_modules/webpack/lib/WebpackOptionsDefaulter.js`。
我们看几个重要易懂的配置就明白了：
 - 入口文件设置：
   - 默认路径`this.set("entry", "./src");`
   - 默认文件`this.set("resolve.mainFiles", ["index"]);`
 - 出口文件：
   - 默认路径`this.set("output.path", path.join(process.cwd(), "dist"));`
   - 默认文件`this.set("output.filename", "[name].js");`
...其他的就不看了。
## 快速上手
有了默认配置，那我们先来试验下:
```shell
mkdir src
touch src/index.js
```
写入：
```javascript
console.log("Hello Webpack!");
```
运行:
```shell
nodejs node_modules/webpack/bin/webpack.js
```
结果：
```shell
Hash: d6bfd4cfe48b9a2d3473
Version: webpack 4.29.6
Time: 737ms
Built at: 03/23/2019 11:00:23 AM
  Asset       Size  Chunks             Chunk Names
main.js  959 bytes       0  [emitted]  main
Entrypoint main = main.js
[0] ./src/index.js 30 bytes {0} [built]
```
现在就多出了`dist`文件夹和`dist/main.js`文件，也是我们最终需要的打包好的文件，你可以直接引用到`html`文件中。
**试一下**:
```shell
nodejs dist/main.js
```
output:
```shell
Hello Webpack!
```
**编写html导入**
`touch dist/index.html`
```html
<!doctype html>
<html>
    <head>
        <title>
            webpack learning
        </title>
    </head>
    <body>
        
    </body>
    <script src="./main.js">
    </script>
</html>
```
打开浏览器看`console`输出和命令行输出时一模一样的。
## 重要概念
**`webpack`的四个核心**：
 - 入口
 - 出口
 - loader
 - plugiin

 ## 手动配置
 > `webpack`默认识别的配置文件叫做`webpack.config.js`
 `webpack`是采用的nodejs方式编写的，我们来写一个

 `webpack.config.js`:
 ```javascript
 const path = require('path');

module.exports = {
    mode: 'development', // 模式 默认两种production 和 development
    entry: './src/index.js', // 入口
    output: { // 出口
        filename: 'bundle.js', // 生成的文件名
        path: path.resolve(__dirname, 'dist') // 路径，必须是一个局对路径
    }
};
 ```
这里的模式区别在于：
 - 生成的出口文件，开发模式的文件时压缩简化过得，基本不能阅读，而生产模式的呢更适合阅读
 - 其他的却别目前未了解

现在删除前面的`main.js`，重新来执行`webpack`命令，现在的话`dist`目录下多了`bundle.js`文件，并且和之前的`main.js`文件内容有所差别了，不过效是一样的。

**为啥取名为`wewbpack`呢？**
我们执行`webpack`命令时会去调用`node_modules/webpack-cli/bin/config-yargs.js`,这里就指定了配置文件名称：
```javascript
...
defaultDescription: "webpack.config.js or webpackfile.js",
...
```
那么可以取名为：`webpack.config.js`或者`webpackfile.js`。
其实名称也可以修改的，我们使用命令参数的方式来调用自定义配置文件:
```shell
nodejs node_modules/webpack/bin/webpack.js --config mywebpack.config.js
```
## 分析`webpack`解析过程
先来添加一个模块`src/myModule.js`:
```javascript
function myModule() {
    console.log("I am is myModule!");
}
module.exports = myModule;
```
`bundle.js`里面实际上是一个立即执行函数，他的核心作用呢，是循环加载我们指定的入口文件以及入口文件所依赖的文件，函数的参数时一个对象，以依赖的文件做key，文件内的代码做值(是一个函数，函数调用eval())；
立即执行函数里面有个核心函数:`__webpack_require__`，它就是用来把所有的文件加载到自定义的缓存里面；
`__webpack_require__`利用`call`方法、`eval`方法得到每个模块的执行结果;
循环加载的原理在于将nodejs/es6等模块导入方式`require/import`改为`__webpack_require__`函数，那么在执行代码的时候`__webpack_require__`会得到递归调用，从而链式加载所有模块。
## 简化命令
前面的话每次打包都要执行那么长的命令太麻烦了，我们来简化一下:
`package.json`增加:
```json
...
  "scripts": {
      ...
    "build": "nodejs node_modules/webpack/bin/webpack.js",
    ...
  },
  ...
```
现在我们执行:`npm run build`就可以了。

## `html`插件
现在我们有些问题:
### 开发时服务器
就是前面在运行打包好的`index.html`时，我们是通过点开文件来执行的，实际当中肯定就是访问链接了，所以我们需要一个服务器来运行我们的代码，让我们在开发过程中实时看到效果。
安装`webpack-dev-server`，这是一个开发阶段的web服务器:
`cnpm install webpack-dev-server  --save-dev`
现在来配置`webpack.config.js`:
```javascript
    devServer: { // 开发服务器配置
        port: 3000, // 端口
        progress: true,
        contentBase:'./dist', // 默认执行目录
        open: false // 自动打开浏览器
    },
```
`package.json`:
```json
  "scripts": {
    "build": "nodejs node_modules/webpack/bin/webpack.js",
    "dev": "nodejs node_modules/webpack-dev-server/bin/webpack-dev-server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
运行`npm run dev`就可以了。
### `index.html`打包
前面的话我们是自己在`dist`文件夹下写的`index.html`，不过呢我们更希望在`src`目录下编写我们自己的文件，`dist`下面只需要关心`webpack`打包后的结果，那么以后即使`dist`名称变了，不想用这个文件夹来存放打包文件了，那么我们只需要修改配置即可，不需要自己还要去写`index.html`。
 - 把`dist/index.html`移到`src`下面(去掉之前手动添加的`bundle.js`，打包后webpack会自动帮我们导入，我们只关心html文件模板，不关心打包，打包及文件组织有webpack来做)
 - 安装插件`html-webpack-plugin`:
   ```shell
   cnpm install html-webpack-plugin --save-dev
   ```
 - 修改`webpack.config.js`配置:
   ```JavaScript
   const HtmlWebpackPlugin = require('html-webpack-plugin');
   ...
       plugins:[ // 数组，放着所有插件，每个都是一个插件实例
        new HtmlWebpackPlugin({
            template: './src/index.html', // 模板文件
            filename: 'index.html' // 输出文件名，会放在前面配置的出口路径下
        })
    ]
   ```
 - 运行`npm run dev`:
   ```shell
        Asset       Size  Chunks             Chunk Names
    bundle.js    351 KiB    main  [emitted]  main
    index.html  248 bytes          [emitted] 
   ```
   不过这两个文件并没有在`dist`文件加下，而是在缓存里，但是打开浏览器看到的结果是对的，和之前一致。
 - 打包:
   `webpack.config.js`:
   ```javascript
   const HtmlWebpackPlugin = require('html-webpack-plugin');
   ...
       output: { // 出口
        filename: 'bundle.[hash:8].js', // 生成的文件名 [hash]表示加hash值(只要8位)，配合后面的plugin使用
        path: path.resolve(__dirname, 'dist') // 路径，必须是一个局对路径
    },
    ...
        plugins:[ // 数组，放着所有插件，每个都是一个插件实例
        new HtmlWebpackPlugin({
            template: './src/index.html', // 模板文件
            filename: 'index.html', // 输出文件名，会放在前面配置的出口路径下
            minify: { // 压缩html文件
                removeAttributeQuotes: true, // 删除html里面属性的双引号
                collapseWhitespace: true, // 合并成一行
                hash: true // 增加hash戳
            }
        })
    ]
   ```
   现在执行`npm run build`就看到效果了。

## `css`样式处理
### 常用loader
由于`webpack`默认只支持js的打包，所以不管是`html`、`css`还是其他文件都需要使用`loader`和`plugin`来支持。
先来写个`css`，`src/index.css`:
```css
body {
    background-color: aquamarine;
}
```
导入`src/index.js`:
```javascript
const indexCss = require("./index.css");
```
打包`npm run build`,结果报错了:
```shell
Entrypoint main = bundle.4fd4ba91.js
[./src/index.css] 177 bytes {main} [built] [failed] [1 error]
[./src/index.js] 112 bytes {main} [built]
[./src/myModule.js] 89 bytes {main} [built]

ERROR in ./src/index.css 1:5
Module parse failed: Unexpected token (1:5)
You may need an appropriate loader to handle this file type.
> body {
|     background-color: aquamarine;
| }
 @ ./src/index.js 2:17-39
```
不过也提示我们了要安装loader。
那我们来安装loader:`cnpm install css-loader style-loader --save-dev`。
`webpack.config.js`:
```javascript
    module: { // 模块
        rules: [ // 模块解析规则
            // loader的特点是功能单一，所以一般需要好几个，可以是数组，可以是对象，对象可以有更多参数
            // loader是有顺序的，默认从右向左执行(所以需要注意)
            // css-loader是用来处理@import这种语法的
            // style-loader是用来把css插入到head标签里面的，但是我们看打包好的`index.html`里面并没有引入css，因为css被放到
            // bundle.js里面了，不过浏览器样式里面是有的。
            { 
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    'css-loader']
            },
        ]
    }
```
less sass 等等都一样。

### 使用link
> **我们仍然发现一个问题**：
就是css样式只是被插入到html文件的style标签了，我们更希望使用link来链接

安装插件:`cnpm install mini-css-extract-plugin --save-dev`,他就是用来抽离css的,
`webpack.config.js`:
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
...
plugins:[
  ...
  new MiniCssExtractPlugin({
      filename:'main.css' // 输出的css文件名
  }),
]
...
module: {
  ...
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
  ...
```
### 更多的loader
还有处理css的，加前缀适应不同的浏览器autoprefixer、postcss-loader。
### css压缩
压缩优化css文件资源mini-css-plugin:
`cnpm install optimize-css-assets-webpack-plugin --save-dev`
`webpack.config.js`:
```javascript
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
...
    optimization: { // 优化项
        minimizer: [
            new OptimizeCssPlugin()
        ]
    },
```
不过这个时候发现js文件的压缩没有了，我们要安装另一个插件：`cnpm install uglifyjs-webpack-plugin --save-dev`。
`webpack-config.js`:
```javascript
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
...
new UglifyjsWebpackPlugin({
    cache: true, // 是否缓存
    parallel: true, // 并发，一起压缩多个
    sourceMap: true
}),
```
`npm run build`
报错：`ERROR in bundle.js from UglifyJs`,后面再在解决。

## 转化js代码
主要是es6转化为es5，因为不是所有浏览器都支持es6.
`cnpm install babel-loader @babel/core @babel/preset-env --save-dev`
`webpack-config.js`:
```javascript
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
```
现在我们写的es6语法的语句会被转换为es5，并且前面那个问题也解决了。
另外的话也还有其他的关于跟高级js语法转化为es5语法的插件。
## 打包图片
### 图片使用方式
 - js中创建图片:
   ```javascript
   let img = new Image();
   img.src = 'logo.jpg';
   // 不过这种方式得到的就是一个字符串，最后的图片还得自己放到/dist里面
   import logo from './logo.jpg' // 引入图片，返回的是一个新的图片地址，不是原始图片
   // 安装loader，file-loader
   // 默认生成一张图片到dist目录下，并返回生成的图片名字
   ```
   `index.js`:
   ```javascript
   import logo from './logo.jpg'
   let img = new Image();
   img.src = logo;
   document.body.appendChild(img);
   ```
   `webpack.config.js`:
   ```javascript
    {
        test: /\.(jpg|png|gif)$/,
        use:'file-loader'
    },
   ```
 - css中引用
   我们之前使用的插件css-loader本身是支持的:
   `backgroud-img: url('./logo.jpg');`
 - html中直接插入
   这里的话就要使用loader:`html-withimg-loader`
   `index.html`:
   ```html
        <img src="./logo.jpg" alt="">
   ```
   `webpack.config.js`:
   ```javascript
               {
                test: /\.html$/,
                use: 'html-withimg-loader'
            },
   ```

### 对于小图片直接转化为base64格式嵌入在代码里
这样做是为了减少请求次数:`url-loader`
`webpack.config.js`:
```javascript
test: /\.(jpg|png|gif)$/,
// use:'file-loader'
// 当图片小于200k时把图片打包成base64编码，否则使用file-loader来产生一张真实存在的图片
use: {
    loader: 'url-loader',
    options: {
        limit: 200 * 1024,
        outputPath: 'img' // 存放到img目录下,并且最后的图片路径会自动加上路径
        // 像其他的文件也可以加路径进行分类，配合publicPath使用更佳
    }
}
```

## 多页打包
多页打包，也就是我们可能需要使用多个js生成多个js文件，那么就需要使用多页打包机制:
我们再来创建一个js文件:`src/home.js`;
修改`webpack.config.js`:
```javascript
    // entry: './src/index.js', // 入口
    entry: {
        index: './src/index.js',
        home: './src/home.js'
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
        ...
```
运行：`npm run build`就看到效果了。

## 代码变化自动打包
> 当代码变化时使用`watch`自动实时打包代码.
`webpack.config.js`:
```javascript
    watch: true,
    watchOptions: {
        poll: 1000, // 单位是毫秒，即每秒一次
        // 当第一个文件更改，会在重新构建前增加延迟。
        aggregateTimeout: 500,// 防抖 比如一直输入代码，
        ignored: /node_modules/  // 这个文件不需要监控
    },
```
## 小插件
 - `cleanWebpackPlugin` 清除，每次打包之前把输出目录下的文件先删掉，这样下面的文件都是最新的，需要的，不会出现上次留下的不需要的文件
   ```javascript
   const CleanWebpackPlugin = require('clean-webpack-plugin');
   new CleanWebpackPlugin('./dist'), // 
   ```
 - `copyWebpackPlugin` 把其他一些文档也拷贝到输出目录，当作最终的打包文件。
   ```javascript
   const CopyWebpackPlugin = require('copy-webpack-plugin');
           new CopyWebpackPlugin([ // 一个数组
            {from:'./README.md', to:'./'}
        ]),
   ```
 - `bannerPlugin` 内置
   ```javascript
   const webpack = require('webpack');
   new webpack.BannerPlugin('make 2019 by astralrovers'), // 给每个文件加注释，不过只有js和css文件有
   ```

## 关于简单的跨域
这里配置的跨域是关于`webpack-server`的，比如我们自己用`express`写了个服务器:
`server.js`
```javascript
const express = require('express');

let app = express();

app.get('/user', (req, res) => {
    res.end('hello');
});

app.listen(3000);
```
上边的服务器在我们访问:`http://localhost:3000/user/`时返回`hello`
但是呢我们想通过`webpack-server`的服务器访问`http://localhost:8080/api/user/`去访问`express`服务器的这个页面，
这个时候就要用到跨域了：
`webpack.config.js`
```javascript
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // 目标域名
                pathRewrite: {
                    '/api':'' // 替换路径，把webpack-server访问的路径里面的/api替换为空，只要后面的路径
                                // http://localhost:8080/api/user/ ==> http://localhost:3000/user/
                }
            }
        }
```

另外的话也可以使用模拟的方式（钩子函数，在访问前面加一层），这个时候就不是跨域了，而是模拟接口：
```javascript
        before(app) {
            app.get('/user', (req, res) => {
                res.end('hello');
            });
        }
        // 直接访问http://localhost:8080/user/
```

另外一种方法是使用服务端启动webpack，就不存在跨域了，而且直接使用服务器的端口:
`server.js`
```javascript
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');

let app = express();

let config = require('./webpack.config.js');

let compile = webpack(config);

app.use(webpackMiddleware(compile));

app.get('/user', (req, res) => {
    res.end('hello');
});

app.listen(3000);
```
直接访问`http://127.0.0.1:3000/user`和`http://127.0.0.1:3000`

## `resolve`的用法
[比较详细的参考](https://www.cnblogs.com/joyco773/p/9049760.html)
## 环境变量插件
前面已经使用到一些环境变量，比如:`PORT`、`NODE_ENV`，可以在运行的时候进行设置
不过`webpack`自带的插件`webpack.DefinePlugin`
`webpack.config.js`:
```javascript
        // new webpack.DefinePlugin({
        //     MY_ENV: "test_mode"
        // }),
```
## 不同环境使用不同配置
对于前面环境变量，再更换环境时总得修改变量值，比较繁琐，之前也提到过`webpack`可以使用不同名称的配置文件，那么可以单独为某些环境使用特定的配置文件:
 - `webpack.base.js`，公共的基础配置
 - `webpack.development.js`，开发环境的配置
 - `webpack.production.js`，生产环境的配置

我们需要使用`webpack-merge`:`cnpm install webpack-merge --save-dev`
`webpack.base.js`:
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

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
    ],
    module: {
        rules: [
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
```
`webpack.development.js`:
```javascript
let smart = require("webpack-merge");
let base = require("./webpack.base.js");

module.exports = smart(base, {
    mode: 'development'
});
```
`webpack.production.js`:
```javascript
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
```
运行：
`cnpm run build -- --config webpack.development.js`
`cnpm run build -- --config webpack.production.js`

## 优化
### noParse
`webpack`的特性会检查每个导入包自己内部的一些依赖关系，不过有时候有些包是独立的，没有依赖关系，那么我们可以指定他们不需要被解析依赖关系，以节约时间：
`webpack.base.js`
```javascript
module:{
    noParse: /jquery/ // 这个包不需要解析依赖关系
}
```
### 文件查找
```javascript
test:/\.js$/,
use: {
    loader: 'babel-loader',
    options: {
        presets: [
            '@babel/preset-env'
        ]
    }
}
```
像这样的一条规则，默认也会查找其他的js文件，我们需要排除一些文件：
```javascript
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
```
### `IgnorePlugin` 一个时间库`moment`
[官网](http://momentjs.cn/)
这个时间库拥有十分丰富的功能，并且支持各国语言。
`cnpm install moment --save`
`index.js`
```javascript
import moment from "moment";
moment.locale('zh-cn');

let nowTime = moment().endOf('day').fromNow();
console.log(nowTime);
```

这个包很大，但是我们这里只需要使用中文包(里面有个./locale目录，很大)，所以有些插件得过滤：
`webpack.base.js`
```javascript
new webpack.IgnorePlugin(/\.\/locale/, /moment/), // 忽略那个插件的哪个目录
```
不过这个时候请我们使用的中文包失效了，需要手动引入：
```javascript
// 手动引入
import 'moment/locale/zh-cn';

moment.locale('zh-cn');
```

### `dllPlugin`

关于库的优化

### `happypack`多线程打包

`cnpm installhappypack --save-dev`

### 最好使用`import`导入

> 生产环境下，import 导入的模块，`webpack`会自动省略掉无用的代码，而使用`require`不行。

### 抽离公共代码

**主要是因为多页面应用时，如果都用到同一个模块，那么如果每个页面都打包自己的依赖，那么最造成冗余，性能降低，使用公共大麦后，只需要打包一份共同的依赖，共享使用。**

> 可以通过配置`webpack`来做，把多个小文件合成一个。
>
> `optimization`选项中的`splitChunks`。