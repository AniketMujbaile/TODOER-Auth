require('dotenv').config()
//requre express
const express=require('express');

//setting port
const port= process.env.PORT || 8000;

//making app
const app =express();

//connecting to db
const db=require('./config/index');
//requiring express
const session=require('express-session');

//requiring flash
const flash=require('connect-flash');
const cookieParser = require('cookie-parser');
const md5 = require('md5');
const passport = require('passport');
const LocalStrategy=require('./config/passport-local');
const GoogleStrategy=require('./config/passport-google-outh2');
const MongoStore  = require('connect-mongo')(session);
const nodemailer=require('nodemailer');

const path = require('path');
const bodyParser = require('body-parser');
//const router = require('./router/web')

// // Database Connection  
// const { connectMonggose } = require('./config/index.js')
// connectMonggose();

// setup static assets 
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: true }));


// setup middleware 
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Routes  
//app.use(router);

//setting view engine
app.set('view engine','ejs');
app.set('views','./views');

//setting static folder
app.use(express.static('./assest'));

//encode post request
app.use(express.urlencoded());

//embediing cokkie in your req
app.use(cookieParser());

app.use(session({
    name:'auth-id',
    secret:'anything',
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:(1000*60*60)
    },
    store:new MongoStore(
        {
            mongooseConnection:db,
            autoRemove:'disabled'
        },function(err){
            console.log(err||'succes');
        }
    )
})
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//setting authentication User
app.use(passport.setAuthenticationUser);
app.use('/',require('./router/index'));
app.listen(port,function(err){
    if(err){
        console.log(`error occur ${err}`);
        return;
    }
    console.log(`we coonect to port ${port}`);
});
// client id 415880099284-6hqm0ghvh5vkc2cledv05tmq5avs12uc.apps.googleusercontent.com
//client secret: avKAEoWu7sJ7mJdoNtDz-PcD

