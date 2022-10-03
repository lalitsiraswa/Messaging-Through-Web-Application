const User = require("../model/user");
const P2pMapper = require("../model/p2pMapper");
const PersonalChannel = require("../model/personalChannel");
const { tokenDecoder, getTokenFromHeader } = require("../helper/jwt");
const MyError = require("../helper/error");
const { default: mongoose } = require("mongoose");

const channelSaver = async (low, high, id) => {
  console.log(high);
  const user = await User.findOneAndUpdate({ username: low }, {
    $push: {
      directMessage: {
        username: high,
        chatId: id,
        lastMessage: null
      },
      notification: { chatName: high, count: 0, lastMessage: 0 }
    }
  });
};


exports.getDirectMessagesList = async (req, res) => {
  try {
    const incomingToken = getTokenFromHeader(req);
    const { username } = tokenDecoder(incomingToken);
    User.findOne({ username }).exec().then((user) => res.status(200).json({
      status: "OK",
      message: "Direct message fetched successfully!",
      chatList: user.directMessage
    }).catch((err) => res.send(500).json({
      status: "ERROR",
      message: err.message
    })));
  } catch (err) {
    return res.status(err.status).json({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.getDirectMessage = async (req, res) => {
  try {
    const { sender, receiver } = req.query;
    if (sender === receiver) {
      throw new MyError(400, "ERROR", "Malicious Request!!");
    }
    const newChatId = new mongoose.Types.ObjectId();
    const lowerUser = sender < receiver ? sender : receiver;
    const higherUser = sender > receiver ? sender : receiver;
    P2pMapper.findOne({ lowerUser, higherUser }).then(async (mapper) => {
      if (mapper === null || mapper === undefined) {
        const newChatChannel = new PersonalChannel({
          _id: newChatId,
        });
        newChatChannel.save();
        const p2pMapper = new P2pMapper({
          lowerUser,
          higherUser,
          chatId: newChatId
        });
        channelSaver(sender, receiver, newChatId);
        channelSaver(receiver, sender, newChatId);
        p2pMapper.save();
        console.log(newChatId.toString());
        return newChatId.toString();
      }
      return mapper.chatId;
    }).then(async (id) => {
      console.log(id);
      return await PersonalChannel.findById({ _id: id }, {
        conversation: {
          $slice: -100
        }
      }).populate('conversation');
    }).then((chatData) => {
      const payload = {
        _id: chatData._id,
        channelName: receiver,
        participants: [ { username: sender }, { username: receiver } ],
        conversation: chatData.conversation,
        files: chatData.files,
        createdAt: chatData.createdAt
      };
      return res.status(200).json({
        status: "OK",
        message: "Messages has been fetched successfully!!",
        channelData: payload
      });
    }
    ).catch((err) => {
      console.log(err);
      return res.status(500).json({
        status: "ERROR",
        message: err.message
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message
    });
  }
};