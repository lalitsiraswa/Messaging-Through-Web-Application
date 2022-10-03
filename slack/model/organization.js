const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  organizationName: { type: String, unique: true },
  workspaces: [ {
    id: mongoose.Types.ObjectId,
    name: String,
    owner: String,
    _id: false,
  } ],
  admin: { type: String, unique: true },
  subAdmin: [ { type: String } ],
  isActive: { type: Boolean, default: true },
});

const organizationModel = mongoose.model("Organization", organizationSchema);

module.exports = organizationModel;