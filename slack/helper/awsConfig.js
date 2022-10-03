
exports.awsConfig = (aws) => aws.config.update({
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY,
  region: process.env.S3_REGION
});
