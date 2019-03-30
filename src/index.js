const myModule = require("./myModule");
const indexCss = require("./index.css");
import moment from "moment";

// 手动引入
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

let nowTime = moment().endOf('day').fromNow();
console.log(nowTime);

// import logo from './logo.jpg'
// let img = new Image();
// img.src = logo;
// document.body.appendChild(img);

console.log("Hello Webpack!");
// /* eslint-disable no-undef */
// console.log("mode: " + MY_ENV);