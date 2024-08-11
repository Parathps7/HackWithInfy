const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery',true)

const connectDb = async () => {
    try{
        mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database live!");
    }
    catch(e)
    {
        console.log(e);
        process.exit(1);
    }
};

module.exports = connectDb;