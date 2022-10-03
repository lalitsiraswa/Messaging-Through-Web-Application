const router = require('express').Router();
const { tokenVerifier } = require('../helper/jwt');
const workspaceController = require("../controller/workspace");

const CONST = "/workspace";

router.get(CONST, tokenVerifier, workspaceController.getWorkspace);
// router.get(CONST + "/users/:username", tokenVerifier, workspaceController.getWorkspaceUsers);
router.post(CONST + "/add", tokenVerifier, workspaceController.addWorkspace);
router.post(CONST + "/add-employee", tokenVerifier, workspaceController.addEmployee);
router.post(CONST + "/add-handler", tokenVerifier, workspaceController.addHandlers);
router.get(CONST + "/accept-invite", tokenVerifier, workspaceController.invitesList);

module.exports = router;