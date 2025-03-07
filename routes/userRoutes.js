const express = require('express');
const { registerUser, loginUser, getUserProfile, logOutUser, forgotPassword, resetPassword, getDoctors } = require('../controller/userController');
const router = express.Router();

router.post('/register', registerUser);

// router.route("/register").post((req, res)=>{
//     res.status(200).json({message: 'Register the user'});
// });

router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.get('/logout', logOutUser);
router.get('/doctors', getDoctors);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;