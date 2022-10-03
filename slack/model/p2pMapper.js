const mongoose = require("mongoose");

const p2pMapperSchema = new mongoose.Schema({
  lowerUser: String,
  higherUser: String,
  chatId: { type: String, index: true, unique: true },
  // _id: false
});

const p2pMapperModel = mongoose.model("p2pMapper", p2pMapperSchema);

module.exports = p2pMapperModel;