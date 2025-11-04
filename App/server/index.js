require('dotenv').config();
const express=require("express");
const app=express();
const authRoute=require("./router/auth-router");
const ConnectDb =require("./db");
const errorMiddleware=require("./middleware/error-middleware");
const cors = require("cors");
const adminRoute = require("./router/admin-router");
const otpRoute = require("./router/otp-router");


// const corsOptions={
//     origin:["http://localhost:5173","http://localhost:5000"],
//     methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
//     Credential:true,
// }
app.use(cors());


app.use(express.json());

app.use("/api/auth",authRoute);
app.use("/api/admin",adminRoute);
app.use("/api/otp",otpRoute);
app.use(errorMiddleware);

const port=5000;

ConnectDb().then(()=>{
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})