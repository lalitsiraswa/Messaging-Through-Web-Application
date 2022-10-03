const mongoose = require("mongoose");

const personalChannelSchema = new mongoose.Schema({
    conversation: [ {
        type: mongoose.Types.ObjectId,
        ref: "Message"
    } ],
    files: [ {
        type: mongoose.Types.ObjectId,
        ref: "File"
    } ],
    createdAt: { type: Number, default: Date.now }
});

const personalChannelModel = mongoose.model("personalChannel", personalChannelSchema);

module.exports = personalChannelModel;