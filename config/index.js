require('dotenv').config()
const mongoose=require('mongoose');

//fill your database name here
//mongoose.connect('mongodb://127.0.0.1:27017/authentication_db');
mongoose.connect(process.env.DATABASE_URL)

const db=mongoose.connection;

db.on('error',console.error.bind('console','error'));

db.once('open',function(){
    console.log('Connected to database');

});

module.exports=db;