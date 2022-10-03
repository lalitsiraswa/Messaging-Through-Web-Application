const router = require("express").Router();

const groupChannelController = require("../controller/groupChannel");
const { tokenVerifier } = require("../helper/jwt");

const CONST = "/workspace";

router.get(CONST + "/channel", tokenVerifier, groupChannelController.getGroupChannel);
router.post(CONST + "/add-channel", tokenVerifier, groupChannelController.addGroupChannel);
router.post(CONST + "/deactivate-channel", tokenVerifier, groupChannelController.deActivateGroupChannel);
router.post(CONST + "/activate-channel", tokenVerifier, groupChannelController.activateGroupChannel);
router.post(CONST + "/:channelName/add-participant", tokenVerifier, groupChannelController.addParticipantInChannel);
router.post(CONST + "/:channelName/remove-participant", tokenVerifier, groupChannelController.removeParticipantFromChannel);

module.exports = router;
