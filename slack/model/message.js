const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  textMessage: String,
  type: String,
  timeStamp: { type: Number, default: Date.now },
});

const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;