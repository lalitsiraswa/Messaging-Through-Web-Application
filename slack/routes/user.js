const router = require("express").Router();

const userController = require("../controller/user");
const { tokenVerifier } = require("../helper/jwt");

router.get("/user/:username", userController.getUser);
router.get("/users/:username", tokenVerifier, userController.getUsers);
router.get("/user-info/:username", tokenVerifier, userController.getUserInfo);
router.post("/signup", userController.signUp);
router.post("/login", userController.logIn);
router.post("/add-details", tokenVerifier, userController.addOtherDetails);

router.post("/forgot-password", userController.forgotPassword);
router.post("/forgot-password/:token", userController.resetPassword);
module.exports = router;
