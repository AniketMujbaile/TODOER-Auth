//requiring passport
const passport=require('passport');

//local strategy
const LocalStrategy =require('passport-local').Strategy;

//requiring model
const userModel=require('../models/userModel');
const md5 = require('md5');
//requring noty



//authentication
passport.use(new LocalStrategy(
    {
        usernameField:'email'
    },
    function(email,password,done){
        userModel.findOne({email:email},function(err,user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null,false,{ message: 'this email is not registered' });

            }
            if(user.password!=md5(password)){
                 return done(null, false,{ message: 'Incorrect password.' });
                
            }
            return done(null,user);
        });
    }
));

//if authenticate serilize it
passport.serializeUser(function(user,done){
    done(null,user['_id']);

});

passport.deserializeUser(function(id,done){
        userModel.findById(id,function(err,user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null,false);
            }
            return done(null,user);
        });
});

// checking authentication of user it is a middleware
passport.checkAuthenticationUser=function(req,res,next){
    if(req.isAuthenticated()){
       return  next();
    }
    return res.redirect('/user/signIn');
};

//setting authentication so to use in our local view

passport.setAuthenticationUser=function(req,res,next){
  res.locals.errorMessage=req.flash('error');
  res.locals.successMessage=req.flash('success');
    if(req.isAuthenticated()){
        res.locals.user=req.user;
    }
     return next();
}