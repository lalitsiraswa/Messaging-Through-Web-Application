const Message = require("../model/message");
const GroupChannel = require("../model/groupChannel");
const PersonalChannel = require("../model/personalChannel");
const P2pMapper = require("../model/p2pMapper");
const User = require("../model/user");
const mongoose = require("mongoose");
const Notification = require("../model/notification");
const Workspace = require("../model/workspace");

const lastMessage = async (username, sender, timeStamp) => {
    await User.updateOne({ username: username }, {
        $set: { "directMessage.$[elem].lastMessage": timeStamp }
    }, { arrayFilters: [ { "elem.username": sender } ] });
};

const produce = async (topicName, message, kafka, isPrivate) => {
    const newMessage = new Message(message);
    const producer = kafka.producer();
    const producingMessage = async (msg) => {
        const serialisedMessage = JSON.stringify(msg);
        await producer.connect();
        await producer.send({
            topic: topicName.toString(),
            messages: [ { key: msg._id.toString(), value: serialisedMessage } ]
        });
    };
    producingMessage(message);
    if (isPrivate) {
        const { sender, receiver, timeStamp } = newMessage;
        lastMessage(receiver, sender, timeStamp);
        lastMessage(sender, receiver, timeStamp);
        await PersonalChannel.findOneAndUpdate({ _id: topicName }, {
            $push: {
                conversation: message._id
            },
            lastMessage: newMessage.timeStamp
        });
    } else {
        await GroupChannel.findOneAndUpdate({ _id: topicName }, {
            $push: {
                conversation: message._id
            },
            lastMessage: newMessage.timeStamp
        });
        await Workspace.updateOne({ channels: { $elemMatch: { name: message.receiver } } }, {
            $set: { "channels.$[elem].lastMessage": newMessage.timeStamp }
        }, { arrayFilters: [ { "elem.name": message.receiver } ] });
    }
    newMessage.save();
};

module.exports = produce;
