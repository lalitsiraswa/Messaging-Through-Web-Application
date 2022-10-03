//helper
const { tokenDecoder, getTokenFromHeader } = require("../helper/jwt");
const MyError = require("../helper/error");

//DBs
const Workspace = require("../model/workspace");
const GroupChannel = require("../model/groupChannel");
const PersonalChannel = require("../model/personalChannel");

exports.getGroupMessages = async (req, res) => {
  try {
    const { skip, groupName } = req.query;
    console.log(req.query);
    const incomingToken = getTokenFromHeader(req);
    const { workspace } = tokenDecoder(incomingToken);
    console.log(workspace);
    Workspace.findOne({ workspaceName: workspace, channels: { $elemMatch: { name: groupName } } }).exec().then((result) => {
      if (result === null || result === undefined) {
        throw new MyError(404, "ERROR", "No result found!!");
      }
    }).then(async () => await GroupChannel.findOne({ channelName: groupName }, {
      conversation: {
        $slice: [ -((1 + +skip) * 50), 50 ],
      }
    }).populate("conversation")).then((channelData) => res.status(200).json({
      status: "OK",
      message: "All message has been fetched!",
      conversation: channelData.conversation
    })).catch((err) => res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message || "Something is not right!",
    }));
  } catch (err) {
    return res.status(err.stausCode || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong while fetching group messages :(",
    });
  }
};

exports.getPersonalMessage = async (req, res) => {
  try {
    const { groupName, skip } = req.query;
    PersonalChannel.findOne({ _id: groupName }, {
      conversation: {
        $slice: [ -((skip + 1) * 100), 100 ],
      }
    }).populate("conversation").then(
      (p2pChat) => res.status(200).json({
        status: "OK",
        message: "All messages has been fetched!",
        conversation: p2pChat.conversation,
      })
    ).catch((err) => res.status(500).json({
      status: "ERROR",
      message: err.message,
    }));
  } catch (err) {
    return res.status(err.status).json({
      status: "ERROR",
      message: err.message,
    });
  }
};

// exports.postMessage = async (req, res) => {
//   const { message } = req.body;
//   const newMessage = new Message({
//     _id: new mongoose.Types.ObjectId(),
//     sender: message.sender,
//     receiver: message.receiver,
//     textMessage: message.textMessage,
//   });
//   console.log(newMessage._id);
//   const x = await GroupChannel.findOneAndUpdate(
//     { channelName: message.receiver },
//     {
//       $push: {
//         conversation: newMessage._id,
//       },
//     }
//   );
//   newMessage.save();
//   res.json(x);
// };
