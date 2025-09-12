

const express = require("express");
const { register, login , activateAccount } = require("../auth/auth.controller");
const validator = require("../../middleware/validator.middleware");
const { RegisterUserDTO, LoginUserDTO } = require("./auth.validator");

const router = express.Router();

router.post("/register", validator(RegisterUserDTO), register);
router.post("/login", validator(LoginUserDTO), login);
// router.get("/activate/:token", activateAccount); // Add this line if you have an activateAccount function

module.exports = router;
