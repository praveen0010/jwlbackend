const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminSchema');
const bcrypt = require("bcryptjs");

const createSchema = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
        email: email,
        password: hashedPassword,

    });
    if (newAdmin) {
        res.status(200).json({ _id: newAdmin.id, email: newAdmin.email, message: "User created successfully" })
    } else {
        res.status(400);
        throw new Error('Admin data is not valid')
    }
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (admin && (await bcrypt.compare(password, admin.password))) {
        res.status(200).json({
            _id: admin.id,
            email: admin.email,
            message: "Login successful"
        });
    } else {
        res.status(401).json({ message: "Invalid credentials" }); // Unauthorized
    }
});


const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await Admin.findOne({ email });

    if (!user) {
        res.status(404).json({ message: "Admin not found" });
        return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password in database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
});



module.exports = { createSchema, loginAdmin, resetPassword }
