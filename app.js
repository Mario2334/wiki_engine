var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebars = require('express-handlebars')
var bodyParser = require('body-parser')
var indexRouter = require('./routes/index');
var pagesRouter = require('./routes/pages');
var db = require('./models');
var reset_db = require('./config').reset_db
var app = express();
let pageService = require('./services/pageService')

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// view engine setup
app.set('view engine', 'hbs');

app.engine('hbs',handlebars({
  layoutsDir:__dirname + '/views',
  defaultLayout:'layout',
  partials: __dirname+"/view/partials",
  helpers:require('./services/helpers').helpers,
  extname:'hbs'
}));

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/page', pagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  res.status(404).render('404');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  let message = err.message;
  // render the error page
  res.status(err.status || 500);
  res.render('500',{message:message});
});

db.sequelize.sync({force:reset_db}).then((a)=>{
  //Initial Sync for database
  if(reset_db) {
    pageService.cleanup_fts();
    pageService.setup_fts();
    pageService.inject_data().then(() => console.log("Syncing Done"));
  }else {
    console.log("Syncing Done")
  }
});

module.exports = app;
