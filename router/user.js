const express=require('express');

const userRouter=express.Router();

//requring passport
const passport=require('passport');


const controller=require('../controller/userController');
userRouter.get('/',controller.home);

userRouter.get('/signUp',controller.signUp);

userRouter.post('/create',controller.create);

userRouter.get('/home', controller.home);

//todo
userRouter.post('/user/createTask', controller.createTask);

userRouter.get('/', controller.getTasks);

userRouter.post('/user/deleteTasks', controller.deleteTasks);

userRouter.get('/editTask/:id', controller.editTask);

userRouter.get('/searchTasks', controller.searchTasks);

//handling rputer for sign-in
userRouter.get('/signIn',controller.signIn);

//handling create session
userRouter.post('/create-session',passport.authenticate(
    'local',
    {failureRedirect:'/user/signIn',failureFlash: true}),controller["create-session"]);

userRouter.get('/profile',passport.checkAuthenticationUser,controller.profile);

userRouter.get('/signOut',controller.signOut);

//setting routes for accessing google

userRouter.get('/auth/google', passport.authenticate(
    'google', {scope: ['profile', 'email']}));

//setting routes for accessing google  callback

userRouter.get('/auth/google/callback',passport.authenticate(
    'google',
    {failureRedirect:'/user/signIn'}
),controller["create-session"]);

//getting route for changeing password
userRouter.get('/changePassword',passport.checkAuthenticationUser,controller.changePassword);

//updating password
userRouter.post('/updatePassword',controller.updatePassword);

//resseting password first verify email
userRouter.get('/resetPassword/verifyEmail',controller.verifyEmail);

//confirming the email
userRouter.post('/resetPassword/confirmEmail',controller.confirmEmail);
//resettig password after getting link
userRouter.get('/resetPassword',controller.resetPassword);

//updating reset password;
userRouter.post('/update/resetPassword',controller.updateResetPassword);
//userRouter.get('/sendEmail',controller.sendEmail);
module.exports=userRouter;