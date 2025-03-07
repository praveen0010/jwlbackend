const asyncHandler = require("express-async-handler");
const jwlUser = require("../models/UserSchema");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const createuser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(role, "role");
    const existingUser = await jwlUser.findOne({ email });
    if (existingUser) {
      return res
        .status(200)
        .json({ success: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await jwlUser.create({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    });
    if (newUser) {
      res.status(200).json({
        _id: newUser.id,
        email: newUser.email,
        message: "User created successfully",
        success: true,
      });
    } else {
      res
        .status(200)
        .json({ message: "User data is not valid", success: true });
    }
  } catch (error) {
    next(error);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const registeredUser = await jwlUser.findOne({ email });
  if (!registeredUser) {
    return res.status(404).json({ message: "User not found!" });
  }

  console.log(registeredUser);

  if (registeredUser) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    registeredUser.resetPasswordToken = resetToken;
    registeredUser.resetPasswordExpire = Date.now() + 1800000;
    await registeredUser.save();

    console.log(registeredUser, "register user");

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SEND_EMAIL,
        pass: process.env.SEND_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "sdmedia.connect@gmail.com",
      to: email,
      subject: "ClinicManage Password Reset Link",
      // text: `Reset Link ${resetUrl}`
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
          .header { background-color: #e03131; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
          .bottom-style { background-color: #e03131; color: white !important; padding: 10px; text-align: center; border-radius: 0 0 8px 8px; }
          .bellow-content { margin-bottom: 25px; }
          .header h1 { color: white; }
          .content { background-color: #fbfbfb; text-align: center; }
          .content h2 { color: #333; padding-top: 20px; margin-top: 0px;}
          .content p { color: #555; }
          .reset-button { margin: 30px 0px; }
          .reset-button a { background-color: #e03131; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; color: #888; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>

          <div class="content">
            <h2>Hello ${registeredUser.name},</h2>
            <p>You recently requested to reset your password for your account. <br/> Click the button below to reset it.</p>
            <div class="reset-button">
              <a href="${resetUrl}" target="_blank">Reset Your Password</a>
            </div>
            <p class="bellow-content">If you did not request a password reset, <br/> please ignore this email or contact support if you have questions.</p>
            <p class="bottom-style">Thank you,<br>ClinicManage Support</p>
          </div>

          <div class="footer">
            <p>&copy; 2024 ClinicManage. All rights reserved.</p>
          </div>
        </div>

      </body>
      </html>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset link sent to your email" });
  }
});
//const resetPassword = asyncHandler(async (req, res) => {});
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  // Extract token from headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Invalid or missing token" });
  }

  const token = authHeader.split(" ")[1]; // Get token from "Bearer <token>"

  console.log(token, newPassword);

  const user = await jwlUser.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "invalid or expired token" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const loginUrl = `http://localhost:3000/login`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SEND_EMAIL,
      pass: process.env.SEND_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "sdmedia.connect@gmail.com",
    to: user.email,
    subject: `Password Reset Success! Welcome back ${user.name}`,
    // text: `Reset Link ${resetUrl}`
    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: #e03131; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; font-size: 25px; }
      .bellow-content { margin-bottom: 25px; font-size: 18px; }
      .header h1 { font-size: 28px; color: white; font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; font-style: italic; }
      .content { background-color: #fbfbfb; text-align: center;  color: #e03131;}
      .content h2 { color: #e03131; padding-top: 20px; margin-top: 0px; font-size: 20px; font-weight: 800;}
      .content p { color: #555; font-size: 15px; }
      .image img { width: 100%; }
       .reset-button { margin: 30px 0px; }
          .reset-button a { background-color: #e03131; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
      .footer { font-size: 15px; text-align: center; color: white; margin-top: 20px; background-color: #e03131; padding: 10px; border-radius: 0px 0px 8px 8px;}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Salemjewellery</h1>
      </div>

      <div class="content">
        <h2>Hello ${user.name},</h2>
        <p>Your Password Reset Successfully.</p>

        <div class='image'>
        <img src='https://i.ibb.co/RvsWqGF/Clinic-Manage-Password-reset-Welcome-Back.jpg'>
        </div>

        <p>Try logging in again.</p>

            <div class="reset-button">
              <a href="${loginUrl}" target="_blank">Login</a>
            </div>

        <p class="bellow-content">Thanks for Choosing ClinicManage. <br/> Enjoy using ClinicManage and increase productivity. </p>
        <p class="bottom-style">Thank you,<br>ClinicManage Support</p>
      </div>

      <div class="footer">
        <p>&copy; 2024 ClinicManage. All rights reserved.</p>
      </div>
    </div>

  </body>
  </html>`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: "Password Reset Successfully" });
});

module.exports = { createuser, forgotPassword, resetPassword };
