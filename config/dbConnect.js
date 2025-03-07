// const mongoose = require("mongoose");
// const MongoDBStore = require("connect-mongodb-session")(
//   require("express-session")
// );

// const connectDb = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000, // Reduce timeout for quick failure
//       connectTimeoutMS: 10000, // Max 10s to connect
//     });
//     console.log("✅ MongoDB Connected");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error.message);
//     process.exit(1);
//   }
// };
// const store = new MongoDBStore({
//   uri: process.env.MONGODB_CONNECTION_STRING,
//   collection: "sessions",
// });

// store.on("error", (error) => console.log(error));
// //module.exports = connectDb;
// module.exports = { connectDb, store };

const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(
  require("express-session")
);
const dotenv = require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reduce timeout for quick failure
      connectTimeoutMS: 10000, // Max 10s to connect
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const store = new MongoDBStore({
  uri: process.env.MONGODB_CONNECTION_STRING,
  collection: "sessions",
});

store.on("error", (error) => console.log(error));

module.exports = { connectDB, store };
