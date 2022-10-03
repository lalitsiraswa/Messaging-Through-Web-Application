const aws = require("aws-sdk");

const File = require("../model/file");
const PersonalChannel = require("../model/personalChannel");
const GroupChannel = require("../model/groupChannel");

const awsConnect = require("../helper/awsConfig");
const { getTokenFromHeader, tokenDecoder } = require("../helper/jwt");
const { getFileName } = require("../helper/fileExtension");
const MyError = require("../helper/error");

const BUCKET = process.env.S3_BUCKET;
awsConnect.awsConfig(aws);

const s3Instance = new aws.S3();

exports.uploadFile = async (req, res) => {
  try {
    const { groupName, isPrivate } = req.query;
    const incomingToken = getTokenFromHeader(req);
    const { username } = tokenDecoder(incomingToken);
    const { key, originalname, size, mimetype } = req.file;
    const id = getFileName(key).toString();
    const newFile = new File({
      _id: id,
      fileKey: key,
      fileName: originalname,
      fileType: mimetype,
      fileOwner: username,
      fileSize: size
    });
    if (isPrivate === "1") {
      await PersonalChannel.findOneAndUpdate({ _id: groupName }, {
        $push: {
          files: id
        }
      });
    } else {
      await GroupChannel.findOneAndUpdate({ channelName: groupName }, {
        $push: {
          files: id
        }
      });
    }
    newFile.save();
    return res.status(200).json({
      status: "OK",
      message: `File has been uploaded successfully!!`,
      file: newFile
    });
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.query;
    const downloadedFile = await s3Instance.getObject({ Bucket: BUCKET, Key: id }).promise();
    return res.status(200).send(downloadedFile);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id, isPrivate, groupName, username } = req.query;
    const key = id.split(".");
    const file = await File.findOne({ _id: key[ 0 ].toString() });
    if (file.fileOwner !== username) {
      throw new MyError(401, "ERROR", "Unauthorized");
    }
    await s3Instance.deleteObject({ Bucket: BUCKET, Key: id }).promise();

    if (isPrivate === "1") {
      await PersonalChannel.findOneAndUpdate({ _id: groupName }, {
        $pull: {
          files: key[ 0 ].toString()
        }
      });
    } else {
      await GroupChannel.findOneAndUpdate({ channelName: groupName }, {
        $pull: {
          files: key[ 0 ].toString()
        }
      });
    }
    await File.findOneAndDelete({ _id: key[ 0 ].toString() });
    return res.status(200).json({
      status: "OK",
      message: "File has been deleted successfully!!"
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      status: "ERROR",
      message: err.message || "Internal server error!!"
    });
  }
};

//Garbage Code 

// exports.getList = async (req, res) => {
//   const response = await s3Instance.listObjectsV2({ Bucket: BUCKET }).promise();
//   const listOfKeys = response.Contents.map((item) => item.Key);
//   res.send(listOfKeys);
// };

// {
//   fieldname: 'file',
//   originalname: 'Screenshot from 2022-05-19 13-53-13.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   size: 57317,
//   bucket: 'kloudchat',
//   key: '628b3fc86ab35fd733cf52ed',
//   acl: 'public-read',
//   contentType: 'application/octet-stream',
//   contentDisposition: null,
//   contentEncoding: null,
//   storageClass: 'STANDARD',
//   serverSideEncryption: null,
//   metadata: null,
//   location: 'https://kloudchat.s3.ap-south-1.amazonaws.com/628b3fc86ab35fd733cf52ed',
//   etag: '"d698b649dc0d2a9786684161de208ac2"',
//   versionId: undefined
// }