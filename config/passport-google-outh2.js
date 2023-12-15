const passport=require('passport');

const Oauth2Strategy=require('passport-google-oauth').OAuth2Strategy;

const crypto=require('crypto');

const userModel=require('../models/userModel');

passport.use(new Oauth2Strategy({
    clientID:'415880099284-6hqm0ghvh5vkc2cledv05tmq5avs12uc.apps.googleusercontent.com',
    clientSecret:'avKAEoWu7sJ7mJdoNtDz-PcD',
    callbackURL:'http://localhost:8000/user/auth/google/callback'
    

},
    function(accesToken,refreshToken,profile,done){
        userModel.findOne({email:profile.emails[0].value}).exec(function(err,user){//finding user
            if(err){//if error
                console.log(`error ${err}`);
                 return done(err);
            }
            if(user){// if user find return it
               
                return done(null,user);
            }
            userModel.create({// if not find create a user
                email:profile.emails[0].value,
                name:profile.displayName,
                password:crypto.randomBytes(20).toString("hex")
            },function(err,user){//if err occur
                if(err){
                    return done(err);
                }
                return done(null,user);
            });
            
        });

    }
));

module.exports=passport;

