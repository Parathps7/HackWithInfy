const express = require("express");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const chatBotRoute = require("./routes/chatBotRoute")
const authRouter = require("./routes/authRoutes")
const connectdb = require("./config/dbConnection")


const app = express()
app.use(express.json());
app.use(cookieParser());
connectdb();

app.get('/',(req,res)=>{
    res.status(200).send({"message":"Working","success":true})
})
app.use("/api/auth", authRouter);

app.use("/api",chatBotRoute);

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})