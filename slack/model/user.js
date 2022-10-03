const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.isEmail,
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  workspace: { type: String },
  avatarUrl: { type: String },
  address: { type: String },
  directMessage: [
    {
      username: String,
      chatId: String,
      lastMessage: { type: Number, default: Date.now },
      _id: false
    },
  ],
  groupChannels: [ { type: String } ],
  notification: [ { chatName: String, count: Number, lastMessage: Number, _id: false } ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
