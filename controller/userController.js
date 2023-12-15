 
//requiring models
const TodoList = require('../models/todoModel')
const userModel=require('../models/userModel');

//requiring md5 for encryption
const md5=require('md5');
const crypto=require('crypto');
const nodemailer= require('nodemailer');
const { readyState } = require('../config');

// Create a new index page task
module.exports.createTask = async (req, res) => {
    try {
        const { description, category, date } = req.body;
        console.log(description, category, date);
        const task = new TodoList({
            description,
            category,
            dueDate: date
        });
        await task.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

module.exports.getTasks = async (req, res) => {
    try {
        let tasks = await TodoList.find().select('-updatedAt -createdAt -__v').sort({ _id: -1 });
        res.render('index', { tasks: tasks });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch tasks.');
    }
};

module.exports.deleteTasks = async (req, res) => {
    try {
        const taskIds = Object.keys(req.body);

        for (const taskId of taskIds) {
            await TodoList.findByIdAndDelete(taskId);
        }

        return res.redirect('back');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

module.exports.editTask = async (req, res) => {
    try {
        const taskId = req.params.id; // Assuming you pass the task ID as a parameter
        const task = await TodoList.findById(taskId).select('-updatedAt -createdAt -__v');

        if (!task) {
            // Task not found
            return res.redirect('/');
        }

        return res.render('editTask', {
            title: 'Edit Task',
            task: task
        });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

module.exports.searchTasks = async (req, res) => {
    try {
        const { searchTerm } = req.query;

        // Use a regular expression to perform a case-insensitive search
        const tasks = await TodoList.find({
            description: { $regex: new RegExp(searchTerm, 'i') }
        }).select('-updatedAt -createdAt -__v').sort({ _id: -1 });

        return res.render('user', {
            title: 'Search Results',
            tasks: tasks
        });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

//making a global print error function
function printError(errValue,errPlace){
    console.log(`error ${err} occur at ${errPlace}`);
    return;
}

//home page only biew when you are login
// module.exports.home= async (req, res) => {
//     //don't let go you home if you are not authenticate
//     if(req.isAuthenticated()){// if autheniticate then only allow to visit
//       let tasks = await TodoList.find().select('-updatedAt -createdAt -__v').sort({ _id: -1 });

//       return res.render('index',{
//         'title':'home page',
//         tasks : tasks 
//     });
// }
//     return res.redirect('/user/signIn');
// };

//home page only View when you are login
module.exports.home = async (req, res) => {
    const perPage = 2; // Number of tasks per page
    const page = req.query.page || 1; // Get the current page from the query parameters

    try {
        if (req.isAuthenticated()) {
            const tasks = await TodoList.find()
                .select('-updatedAt -createdAt -__v')
                .sort({ _id: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);

                const tasksPerPage = 2; // Adjust as needed
                const totalTasks = tasks.length; // Assuming tasks is an array of tasks
                const totalPages = Math.ceil(totalTasks / tasksPerPage);
                const currentPage = parseInt(req.query.page) || 1;

            return res.render('index', {
                title: 'home page',
                tasks: tasks,
                totalPages: totalPages,
                currentPage: currentPage

             });
        }
        return res.redirect('/user/signIn');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

//signup
module.exports.signUp=function(req,res){
  if(!req.isAuthenticated()){//if auhenticate don't allow to sign up
    //console.log('req.flash',req.flash(),req.flash('error2'));
    return res.render('user_sign_up',{
        'title':'sign-up',
    });
} 
  return  res.redirect('/user');
    
};
//create user through local
module.exports.create=function(req,res){
    if(req.body.password==req.body.checkPassword){//checking for password match
        userModel.findOne({email:req.body.email},function(err,user){
            if(err){
                printError(err,"in accessing db");
                return;
            }
            if(user){
                req.flash('error','there is user with this email');
               return res.redirect('/user/signUp'); 
            }else{
                req.body.password=md5(req.body.password);
                userModel.create(req.body,function(err,user){
                    console.log('creating succesfully');
                    console.log(user);
                   return  res.redirect('/user/signIn');
                });
            }
   });
    }else{
       
        req.flash('error','pasword mismatch');
        
        return res.redirect('back');
    }
      //  return res.redirect('back');
};
// sign in
module.exports.signIn=function(req,res){
     if(!req.isAuthenticated()){//if not authetucate then sign in
     return res.render('user_sign_in',{
        'title':'sign in'
        
    });
}
    
    return res.redirect('/user');
};
//creating for usrr sign in

module.exports['create-session']=function(req,res){
      return res.redirect('/user');
};
module.exports.profile=function(req,res){
    res.render('profile');
};
module.exports.signOut=function(req,res){
   if(req.isAuthenticated()){
      
    req.logout();
   }
     return res.redirect('/user/signIn');
};

// forchanging password
module.exports.changePassword=function(req,res){
     return res.render('change_password.ejs',{
        'title':'change password'
    });
}
//update password
module.exports.updatePassword=function(req,res){
    let currentPassword=res.locals.user.password;//stroring current password
    if(currentPassword==md5(req.body.currentPassword)){//comparing both if unequal return
        if(req.body.password==req.body.checkPassword){
            userModel.updateOne(
                {email:res.locals.user.email},
                {$set:{password:md5(req.body.password)}},
                    function(err,user){
                        if(err){
                            console.log('error',err);
                            return;
                        }
                        return res.redirect('/user');

                });
        }else{
            req.flash('error','password mismatch');
            return res.redirect('back');
        }
    }else{
        req.flash('error','current password is not coreect use forgot password');
        return res.redirect('back');
    }
  
  };
  // async function use to send mail i wrap transporter.sendMail with promise and then handle that promise;    
 async function sendPasswordResetEmail(req,res,reciver){
    var transport = nodemailer.createTransport({
       
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "****",
          pass: "****"
        }
        
    /*service: 'gmail',
    auth: {
        user: 'important1729@gmail.com',
        pass: '******' // naturally, replace both with your real credentials or an application-specific password
        }
        */
      });
      let hashcode1=crypto.randomBytes(32).toString("hex");
      let hostUrl="http://localhost:8000/user/resetPassword?";
      let getParameter='hashcode1='+hashcode1+"&email="+reciver;
      let html="<p>Click below link to reset password</p>"+"<a href="+hostUrl+getParameter+">Reset Password</a>";
      const message = {
        from: 'aniketmujbaile@gmail.com', // Sender address
        to: reciver,         // List of recipients
        subject: 'Reset your password', // Subject line
        text: 'This is valid for 2 hour', // Plain text body
        html:html
    };
    let resp=await wrapedSendMail(transport,message,req,res,hashcode1); 
}
async function resetToken(req,res,hashcode1,email){
    let expireDate=new Date();
    expireDate.setHours(expireDate.getHours()+3);
    let query=await userModel.updateMany({email:email},
      {$set:{resetPasswordToken:hashcode1,expireDate:expireDate}},function(err,user){
        if(err){
            req.flash('error','please wrtite your email again');  
            console.log(`eeoe ${err}`);
            return;
        } 
        
      }).then(()=>{
          req.flash('success','ok mail has send to update valid for 2 hour');
        res.redirect('/user/resetPassword/verifyEmail');
      });
      
};
async function wrapedSendMail(transporter,mailOptions,req,res,hashcode1){
    return new Promise((resolve,reject)=>{
   transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log("error is "+error);
       reject(false); // or use rejcet(false) but then you will have to handle errors
    } 
   else {
       console.log('Email sent: ' + info.response);
       resolve(true);
    }
   });
}).then(()=>{
    return resetToken(req,res,hashcode1,req.body.email);
    //return res.redirect('/user');
});
}

module.exports.verifyEmail=function(req,res){
    if(!req.isAuthenticated()){
         return res.render('user_reset_password',{
            'title':'Verify Email ',
            'verifyEmail':true,
            'resetPassword':false
        });
    }else{
    res.redirect('back');
    }
};

module.exports.resetPassword=function(req,res){
    if(!req.isAuthenticated()){
        let date1=new Date();
        userModel.findOne({email:req.query.email},function(err,user){
            if(err){
                console.log(`err`);
                return ;
            }
            if(!user||user.resetPasswordToken!=req.query.hashcode1||user.expireDate<date1){
                return res.end('no authroity');
                //make hashcode invalid;
            }
            res.render('user_reset_password',{
                'title':'reset Password',
                'verifyEmail':false,
                'email':req.query.email,
                'resetPassword':true
            });

        });
    }else{
    res.redirect('back');
    }
};

//verifying the email
module.exports.confirmEmail= async function(req,res){
    if(!req.isAuthenticated()){
        userModel.findOne({email:req.body.email},function(err,user){
            if(err){
                console.log(`err ${err}`);
                return;
            }
            if(!user){
                req.flash('error','No user with this email id');
               return res.redirect('/user/resetPassword/verifyEmail');
            }else{
                //req.flash('success','Mail has been send please check it will valid for 2 hours');
                let mesaage=sendPasswordResetEmail(req,res,req.body.email);
                
          }
        });
    }
};
// update reset password
module.exports.updateResetPassword=function(req,res){
    if(!req.isAuthenticated()){
        if(req.body.checkPassword==req.body.password){
        let changeAccessToken=crypto.randomBytes(30).toString("hex");
         userModel.updateMany({email:req.query.email},
            {$set:{password:md5(req.body.password),resetPasswordToken:changeAccessToken}},function(err,user){
                    if(err){
                        console.log('erroe');
                        return;
                    }
                   
            }).then(()=>{
                res.redirect('/user');
            });
    }else{
    req.flash('error','password mismatch');
    return res.redirect('back');
    }
}
};