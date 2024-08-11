const express = require("express");
const authRouter = express.Router();
const authenticationController = require("../controllers/authController");

// authRouter.route("/loginCheck").post(authenticationController.userExists);
// authRouter.route("/signupCheck").post(authenticationController.userNew);
authRouter.route("/getOTP").post(authenticationController.sendOTP);
authRouter.route("/verifyOTP").post(authenticationController.verifyOTP);
// authRouter.route("/genToken").post(authenticationController.genToken);
// authRouter.route("/verifyToken").post(authenticationController.verifyToken);
module.exports = authRouter;