var express = require('express');

var indexRouter = require('../routes/router');

var app = express();

const whitelist = [
    '*'
];

app.use(cors())

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', indexRouter);

module.exports = app;