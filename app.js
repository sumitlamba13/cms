const express = require('express');
const app=express();
const path = require('path');
const express_handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-Parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl}=require('./config/database');
const passport = require('passport');
mongoose.Promise=global.Promise;
//connect to database
mongoose.connect(mongoDbUrl).then(db=>{
  console.log('MONGOOSE CONNECTED');
}).catch(error=>console.log(error));

//using static
app.use(express.static(path.join(__dirname,'public')));
 // setting up view engine

const {select,generateDate,paginate}=require('./helpers/handlebars-helpers');
app.engine('handlebars',express_handlebars({defaultLayout:'home',helpers: {select:select,generateDate:generateDate,paginate:paginate}}));
app.set('view engine','handlebars');
//upload middlewares
app.use(upload());

//setting body-Parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//set methodOverride
app.use(methodOverride('_method'));

//attach session and flash

app.use(session({
  secret:'sumitlamba12345',
  resave:true,
  saveUninitialized:true
}));
app.use(flash());
//passport
app.use(passport.initialize());
app.use(passport.session());

//local variables using middlewares

app.use((req,res,next)=>{
  res.locals.user=req.user||null;
  res.locals.success_message=req.flash('success_message');
  res.locals.failure_message=req.flash('failure_message');
  res.locals.error=req.flash('error');
  next();
});
//requiring routes
const home = require('./routes/home/index');
const admin=require('./routes/admin/index');
const posts=require('./routes/admin/posts');
const categories=require('./routes/admin/categories');
const comments=require('./routes/admin/comments');
//using routes
app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);

const PORT=process.env.PORT||4500;
app.listen(PORT,()=>{
  console.log(`listening to port 4500`);
});
