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