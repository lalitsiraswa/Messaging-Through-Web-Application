const router = require("express").Router();
const inviteController = require("../controller/invite");

const { tokenVerifier } = require("../helper/jwt");


const CONST = "/workspace";

router.post(CONST + "/create-invite", tokenVerifier, inviteController.generateInviteLink);
router.post(CONST + "/send-invite", tokenVerifier, inviteController.sendInvite);
router.post(CONST + "/private-invite/:hash", inviteController.addingToWorkspace);
router.post(CONST + "/public-invite/:id", tokenVerifier, inviteController.requestAccess);

module.exports = router;