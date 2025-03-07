const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentSchema');
const Razorpay = require('razorpay');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");



const instance = new Razorpay({
    key_id: "rzp_test_EHcuieW86Ce5O5",        // Replace with your Razorpay API Key
    key_secret: "lYLxGDazuhZ4iPkZBRSZrU0y" // Replace with your Razorpay Secret Key
});

const paymentVerification = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = "rzp_test_LbSBa4hZOPOEzk"; // Replace with your secret key
    const hash = crypto.createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
    if (hash === razorpay_signature) {
        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
    }
});

const paymentRefund = asyncHandler(async (req, res) => {
    const { razorpay_payment_id, amount } = req.body;


    try {
        // Refund the payment
        const refund = await instance.payments.refund(razorpay_payment_id, { amount: amount }); // Convert to paise
        res.status(200).json({ success: true, message: "Refund initiated", refund });
    } catch (error) {
        res.status(500).json({ success: false, message: "Refund failed", error: error.message });
    }
});

const getPaymentDetails = async (req, res) => {

    try {
        const { razorpay_payment_id } = req.body;

        if (!razorpay_payment_id) {
            return res.status(400).json({ success: false, message: "Payment ID is required"});
        }

        const payment = await instance.payments.fetch(razorpay_payment_id);

        res.status(200).json({
            success: true,
            message: "Payment details fetched successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment details",
            error: error.message
        });
    }
};




module.exports = { paymentVerification, paymentRefund, getPaymentDetails }