const router = require("express").Router();

const { tokenVerifier } = require("../helper/jwt");

const organizationController = require("../controller/organization");

const CONST = "/organization";

router.get(CONST, tokenVerifier, organizationController.getOrganization);
router.post(CONST + "/add", tokenVerifier, organizationController.createOrganization);
router.post(CONST + "/add-subadmin", tokenVerifier, organizationController.addSubAdmin);
router.post(CONST + "/remove-subadmin", tokenVerifier, organizationController.removeSubAdmin);

module.exports = router;