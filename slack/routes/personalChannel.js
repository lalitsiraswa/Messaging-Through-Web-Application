const router = require("express").Router();

const personalChannelController = require("../controller/personalChannel");
const { tokenVerifier } = require("../helper/jwt");

router.get("/direct-message", tokenVerifier, personalChannelController.getDirectMessage);
router.get("/direct-message-list", tokenVerifier, personalChannelController.getDirectMessagesList);

module.exports = router;