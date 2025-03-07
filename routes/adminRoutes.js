const express = require('express');
const { createSchema,loginAdmin,resetPassword } = require('../controller/adminController');
const router = express.Router();

router.post('/admin', createSchema);
router.post('/adminlogin',loginAdmin);
router.post('/restpassword',resetPassword);

module.exports = router;