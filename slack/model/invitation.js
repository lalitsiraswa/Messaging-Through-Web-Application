const mongoose = require("mongoose");

const invite = {
  username: String,
  groupChannels: Array,
  workspace: String,
  organization: String,
  inviteMaker: String,
};

const invitationSchema = new mongoose.Schema({
  hash: String,
  inviteInfo: invite,
  expiresAt: Date,
  _id: false
});

const Invitation = mongoose.model("Invitation", invitationSchema);
module.exports = Invitation;
