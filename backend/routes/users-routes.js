const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middlewares/file-upload");

const router = express.Router();




router.get("/", usersControllers.getAllUsers);

router.post("/signup", fileUpload.single("image"),
[
  check("email").normalizeEmail().isEmail(),        //HITESH@gmail.com == hitesh@gmail.com
  check("password").isLength({min: 6}),
  check("name").not().isEmpty()
], usersControllers.signup);

router.post("/login", usersControllers.login);




module.exports = router;
