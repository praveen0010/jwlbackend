const express = require("express");
const {
  createuser,
  forgotPassword,
  resetPassword
} = require("../controller/jwluserController");
const router = express.Router();

router.post("/Signup", createuser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
