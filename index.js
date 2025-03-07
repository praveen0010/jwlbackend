// const express = require('express');
// const dotenv = require("dotenv").config();
// const cors = require('cors');
// const connectDb = require('./config/dbConnect');
// const cookieParser = require('cookie-parser');

// connectDb();

// const app = express();

// app.use(express.json());
// const allowedOrigins = [
//     "http://localhost:3000",
//     "https://homepagejwlnew.netlify.app"
// ]
// app.use(cors({
//     origin: function (origin,callback){
//         if(!origin || allowedOrigins.includes(origin)){
//             callback(null,true);
//         }else{
//             callback(new Error("Not allowed by CORS"));
//         }
//     } ,
//     credentials: true,               // Allow cookies to be sent across domains
// }));
// app.use(cookieParser());
// app.use(express.urlencoded({extended: false}));

// app.use("/users", require('./routes/userRoutes'));
// app.use("/records", require('./routes/patientRoutes'));
// app.use("/token", require('./routes/tokenRoutes'));
// app.use("/client", require('./routes/clientRoutes'));
// app.use("/admin", require('./routes/adminRoutes'));
// app.use("/payment", require('./routes/paymentRoutes'));
// app.use("/prices", require('./routes/pricesRoutes'));

// const port = process.env.PORT || 5000;
// app.listen(port, ()=>{
//     console.log(`server is running on ${port}`);
// })

const express = require("express");
const errorHandler = require("../jwlbackend/middelware/errormiddelware");
const dotenv = require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { connectDB, store } = require("./config/dbConnect.js");
const authRoutes = require("./routes/authrouts.js");

const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://homepagejwlnew.netlify.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

// 🔹 Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store, // Store sessions in MongoDB
    cookie: {
      httpOnly: true,
      secure: false, // Change to true in production (for HTTPS)
      sameSite: "strict",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

connectDB();

app.use("/auth", authRoutes);
//app.use("/users", require('./routes/userRoutes'));
app.use("/records", require("./routes/patientRoutes"));
app.use("/token", require("./routes/tokenRoutes"));
app.use("/client", require("./routes/clientRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));
app.use("/prices", require("./routes/pricesRoutes"));
app.use("/user", require("./routes/jwluser"));
app.use(errorHandler);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
