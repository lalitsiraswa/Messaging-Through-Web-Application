const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  isPrivateChat: Boolean,
  chatId: String,
  chatName: String,
  sender: String,
  // isSeen: { type: Boolean, default: false },
  timeStamp: { type: Number, default: Date.now }
});

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;