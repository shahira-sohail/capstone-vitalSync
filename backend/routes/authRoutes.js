const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const validateRequest = require("../middleware/validateRequest");

const {
    registerSchema,
    loginSchema,
} = require("../validators/authValidator");
const authRateLimiter = require("../middleware/authRateLimiter");

router.post("/register", validateRequest(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newUser = new User({
      name,
      email: normalizedEmail,
      password,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

router.post("/login",authRateLimiter, validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({email: normalizedEmail});
    if(!user){
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const token = jwt.sign(
        {userId: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    );

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});
module.exports = router;