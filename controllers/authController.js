const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID } = process.env;
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
//console.log(process.env.DATABASE);
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const getct = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY);
};

// mobile number as uid
exports.sendOTP = async (req, res, next) => {
  try {
    const phoneNumber = req.body.number;

    // Send OTP via Twilio
    const verificationRequest = await twilio.verify.v2
      .services(process.env.VERIFICATION_SID)
      .verifications.create({ to: "+91" + phoneNumber, channel: "sms" });

    // Check if user exists
    const userAvailable = await User.findOne({ phoneNumber });

    if (userAvailable) {
      return res.status(200).json({ status: "success", message: "OTP sent to existing user" });
    } else {
      // Create new user
      const newUser = await User.create({ phoneNumber });

      if (newUser) {
        return res.status(201).json({
          status: "success",
          message: "OTP sent and new user created",
          user: {
            _id: newUser._id,
            phoneNumber: newUser.phoneNumber
          }
        });
      } else {
        return res.status(422).json({ status: "error", message: "User data not valid" });
      }
    }
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const verificationResult = await twilio.verify.v2
      .services(process.env.VERIFICATION_SID)
      .verificationChecks.create({
        code: req.body.code,
        to: "+91" + req.body.number,
      });

    if (verificationResult.status === "approved") {
      const accessToken = jwt.sign(
        {
          user: {
            id: req.body.number
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      // Set the token as an HTTP-only cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Protect against CSRF
        maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
      });

      return res.status(200).json({ status: "success", token: accessToken });
    }

    return res.status(400).json({ status: verificationResult.status });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
