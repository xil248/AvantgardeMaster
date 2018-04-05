const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.dev');


const mongoose=require('mongoose');
global.dbHandle=require("./dbHandle.js");
global.db=mongoose.connect("mongodb://localhost:27017/avantgarde");

const routes = require('../routes/index');
// const users = require('../routes/users');


const app = express();


// router.get('/init', function(req,res,next){/*请求参数，相应参数和负责把错误信息运送出来的next参数*/
//   console.log(`/init !!!!!!`);
//   var noteModel=global.dbHandle.getModel("users");/*获取note数据库模型，模型能直接对数据库进行操作*/
// 	noteModel.find({},function(err,notes){
    
// 		if(err){
// 			return next(err);
// 		}else{
// 			res.json(notes);
// 		}
// 	})
// });


if (process.env.NODE_ENV === 'production') {
  app.use(logger('short'));
} else {
  app.use(logger('dev'));

  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

// Express config


app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.enable('trust proxy');

app.use('/',routes);

// To make browserHistory work for ReactJS
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // var noteModel=global.dbHandle.getModel("note");
  console.log(`Server running on PORT: ${PORT}`);
});

module.exports = app;




