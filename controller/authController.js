const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwlUser = require("../models/UserSchema");
const jwt = require("jsonwebtoken");
// const Login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ message: "User not found" });
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(400).json({ message: "Invalid password" });
//   req.session.user = { id: user._id, role: user.role };
//   res.status(200).json({ message: "success", role: user.role });
// });
const Login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(200)
        .json({ success: false, message: "Email and password are required" });
    }

    // Check if admin exists
    const loginuser = await jwlUser.findOne({ email });

    if (!loginuser) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, loginuser.password);

    if (!isPasswordValid) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid Password" });
    }
    req.session.user = {
      name: loginuser.name,
      email: loginuser.email,
      role: loginuser.role,
    };
    // Store user in session

    console.log(req.session);

    res.status(200).json({
      user: loginuser,
      message: "Login successful",
      success: true,
    });
  } catch (error) {
    console.log("err", error);
    next(error);
  }
});

const Checkuser = asyncHandler(async (req, res) => {
  try {
    console.log(req.session.user);
    console.log(req.session);

    if (req.session.user) {
      return res.json({
        message: "Authenticated",
        user: req.session.user,
      });
    }
    res.status(401).json({ message: "Not authenticated" });
  } catch (error) {
    next(error);
  }

  // if (!req.session.user)
  //   return res.status(401).json({ message: "Unauthorized" });
  // res.json({ user: req.session.user, role: req.session.role });
});

const Logout = asyncHandler(async (req, res) => {
  // res.cookie("token", "", {
  //   httpOnly: true,
  //   expires: new Date(0), // Expire immediately
  // });

  res.clearCookie("connect.sid", { path: "/" });

  res.status(200).json({ message: "Logged out successfully" });

  // req.session.destroy((err) => {
  //   if (err) return res.status(500).json({ message: "Logout failed" });
  //   res.clearCookie("connect.sid");
  //   res.json({ message: "Logged out successfully" });
  // });
});
const deleteAll = asyncHandler(async (req, res, next) => {
  try {
    const result = await jwlUser.deleteMany({}); // Deletes all clients

    res.json({
      message: `${result.deletedCount} clients deleted successfully`,
    });
  } catch (error) {
    console.log("Error Deleting Clients", error);
    next(error);
    //res.status(500).json({ message: "Server Error" });
  }
});
const getusers = asyncHandler(async (req, res, next) => {
  try {
    const users = await jwlUser.find();
    console.log(users);
    res.json(users);
  } catch (error) {
    console.log("Error Fetching Clients", error);
    next(error);
    // res.status(500).json({ message: "Server Error" });
  }
});
const getuser = asyncHandler(async (req, res, next) => {
  try {
    const _id = req.body.userid;
    console.log(_id);
    const user = await jwlUser.findOne({ _id });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(200).json({ message: "user not found" });
    }
  } catch (error) {
    console.log("Error Fetching Clients", error);
    next(error);
    // res.status(500).json({ message: "Server Error" });
  }
});

module.exports = { Login, Logout, Checkuser, getusers, getuser, deleteAll };
