const mongoose = require('mongoose');

const invite = {
    username: String,
    inviteId: { type: mongoose.Schema.Types.ObjectId, ref: "Invitation" },
    _id: false,
};

const workspaceSchema = new mongoose.Schema({
    workspaceName: { type: String, required: true, unique: true, index: true },
    owner: { type: String, required: true },
    handlers: [ { type: String } ],
    employees: [ { type: String } ],
    channels: [ {
        name: String,
        isActive: { type: Boolean, default: true },
        lastMessage: { type: Number, default: Date.now },
        _id: false
    } ],
    invites: [ { type: invite } ],
    createdAt: { type: Number, default: Date.now }
});

const workspace = mongoose.model("workspace", workspaceSchema);

module.exports = workspace;