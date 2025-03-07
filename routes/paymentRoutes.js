const express = require('express');
const { paymentVerification,paymentRefund,getPaymentDetails } = require('../controller/paymentController');
const router = express.Router();

router.post('/verify-payment',paymentVerification);
router.post('/paymentrefund',paymentRefund);
router.post('/getPaymentDetails',getPaymentDetails);



module.exports = router;