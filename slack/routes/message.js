const router = require("express").Router();

const messageController = require("../controller/message");
const { tokenVerifier } = require("../helper/jwt");

router.get("/group-message", tokenVerifier, messageController.getGroupMessages);
router.get("/private-message", tokenVerifier, messageController.getPersonalMessage);
// router.post("/postMessage", messageController.postMessage);
module.exports = router;
