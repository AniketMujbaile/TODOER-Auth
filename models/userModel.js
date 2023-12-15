const mongoose=require('mongoose');

//here fill you entry like name age gender more info what you want to know during sign-in
const UserSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    resetPasswordToken:{
        type:String,
    },
    expireDate:{
        type:Date
    }
});

const userModel=mongoose.model('userModel',UserSchema);

module.exports=userModel;