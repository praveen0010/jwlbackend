const express = require("express");
const {
  Login,
  Logout,
  Checkuser,
  getusers,
  deleteAll,
} = require("../controller/authController");
const router = express.Router();

router.post("/Login", Login);
router.post("/logout", Logout);
router.get("/me", Checkuser);
router.get("/getusers", getusers);
router.delete("/delete", deleteAll);

module.exports = router;
