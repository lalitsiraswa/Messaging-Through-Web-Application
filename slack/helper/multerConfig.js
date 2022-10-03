const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const awsConnect = require("../helper/awsConfig");
const mongoose = require("mongoose");
const { getExtension } = require("./fileExtension");

awsConnect.awsConfig(aws);

exports.multerUpload = () => multer({
  storage: multerS3({
    bucket: process.env.S3_BUCKET,
    s3: new aws.S3(),
    acl: "public-read",
    key: (req, file, cb) => {
      cb(null, new mongoose.Types.ObjectId().toHexString() + "." + getExtension(file.originalname));
    }
  })
});
