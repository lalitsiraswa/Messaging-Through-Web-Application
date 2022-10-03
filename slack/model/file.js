const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileKey: String,
  fileName: String,
  fileType: String,
  fileOwner: String,
  fileSize: Number,
  isDeleted: { type: Boolean, default: false },
  uploadedAt: { type: Number, default: Date.now },
});

const fileModel = mongoose.model("File", fileSchema);

module.exports = fileModel;