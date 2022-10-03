const mongoose = require("mongoose");


const groupChannelSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    channelName: String,
    // avatarUrl: String,
    description: String,
    participants: [ {
        username: String,
        read: { type: Boolean, default: true },
        write: { type: Boolean, default: true },
        _id: false
    } ],
    conversation: [ {
        type: mongoose.Types.ObjectId,
        ref: "Message"
    } ],
    files: [ {
        type: mongoose.Types.ObjectId,
        ref: "File"
    } ],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Number, default: Date.now },
    lastMessage: { type: Number, deafault: Date.now }
});

const groupChannelModel = mongoose.model("groupChannel", groupChannelSchema);

module.exports = groupChannelModel;
