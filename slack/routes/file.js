const router = require("express").Router();

const fileController = require("../controller/file");
const { tokenVerifier } = require("../helper/jwt");
const multerConnect = require("../helper/multerConfig");

const upload = multerConnect.multerUpload();

router.post("/upload", tokenVerifier, upload.single("file"), fileController.uploadFile);
router.get("/download-file", tokenVerifier, fileController.downloadFile);
router.delete("/delete-file", tokenVerifier, fileController.deleteFile);
// router.get("/list", tokenVerifier, fileController.getList);

module.exports = router;