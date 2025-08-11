var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var {engine} = require('express-handlebars')
var fileUpload = require('express-fileupload')
const db = require('./config/connection')
const session  = require('express-session')


require('dotenv').config();

var app = express();
app.use(express.json());
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

// view engine setup
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'hbs');

// Set up the express-handlebars engine with layouts and partials 
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts/'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    equals: (a, b) => a === b,
    inc: (value) => parseInt(value) + 1,
    formatDate: (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB'); // DD/MM/YYYY
    },
    statusClass: (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-success text-white';
    case 'Pending':
      return 'bg-warning text-dark';
    case 'Cancelled':
      return 'bg-danger text-white';
    default:
      return 'bg-secondary text-white';
  }
}
  }
}));

app.use(logger('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload())
app.use(session({secret:"Key",resave:false,cookie:{maxAge:600000}}))
db.connect().catch(console.dir);//connect before route
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const isDev = req.app.get('env') === 'development';

  res.status(err.status || 500).render('error', {
    message: err.message,
    error: isDev ? err : {},
    showStack: isDev // explicit flag for template
  });
});

module.exports = app;
