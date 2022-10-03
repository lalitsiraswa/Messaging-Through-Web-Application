const mongoose = require("mongoose");
const shortId = require("shortid");

const MyError = require("../helper/error");
const { tokenDecoder, getTokenFromHeader } = require("../helper/jwt");

const Workspace = require("../model/workspace");
const GroupChannel = require("../model/groupChannel");
const User = require("../model/user");

exports.addGroupChannel = async (req, res) => {
  try {
    const { channelName, avatarUrl, description } = req.body;
    const token = getTokenFromHeader(req);
    const { id, role, username, workspace } = tokenDecoder(token);
    if (role === "admin" || role === "handler") {
      const uniqueChannelName = channelName + "@" + shortId.generate();
      const newChannel = new GroupChannel({
        _id: new mongoose.Types.ObjectId(),
        channelName: uniqueChannelName,
        avatarUrl: avatarUrl,
        description: description,
        admin: username,
        participants: [],
      });
      newChannel.save().then(() => Workspace.findOneAndUpdate({ workspaceName: workspace }, {
        $addToSet: {
          channels: {
            name: uniqueChannelName
          }
        }
      }).then(() => res.status(200).json({
        status: 'OK',
        message: `Successfully Created ${channelName} channel!!`,
        channelName: uniqueChannelName
      }))).catch((err) => {
        return res.status(500).json({
          status: "ERROR",
          message: err.message
        });
      });
    } else {
      throw new MyError(403, "ERROR", "Unauthorized access");
    }
  } catch (err) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
};


exports.activateGroupChannel = async (req, res) => {
  try {
    const { channelName } = req.query;
    const token = getTokenFromHeader(req);
    const decodedToken = tokenDecoder(token);
    const role = decodedToken.role;
    if (role === "admin" || role === "handler") {
      await Workspace.updateOne({ workspaceName: decodedToken.workspace }, { $set: { "channels.$[elem].isActive": true } }, { arrayFilters: [ { "elem.name": channelName } ] });
      GroupChannel.findOneAndUpdate({ channelName: channelName }, {
        $set: {
          isActive: true
        }
      }).then((channel) => res.status(200).json({
        status: "OK",
        message: "Group has activated successfully!!"
      })).catch((err) => res.status(err.status).json({
        status: "ERROR",
        message: err.message
      }));
    } else {
      throw new MyError(403, "ERROR", "Unauthorized access!!");
    }
  }
  catch (err) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  }
};

exports.deActivateGroupChannel = async (req, res) => {
  try {
    const { channelName } = req.query;
    const token = getTokenFromHeader(req);
    const { id, role, workspace, organization } = tokenDecoder(token);
    if (role === "admin" || role === "handler") {
      await Workspace.updateOne({ workspaceName: workspace }, { $set: { "channels.$[elem].isActive": false } }, { arrayFilters: [ { "elem.name": channelName } ] });
      GroupChannel.findOneAndUpdate({ channelName: channelName }, {
        $set: {
          isActive: false
        }
      }).then((channel) => res.status(200).json({
        status: "OK",
        message: "Group has de-activated successfully!!"
      })).catch((err) => res.status(err.status).json({
        status: "ERROR",
        message: err.message
      }));
    } else {
      throw new MyError(403, "ERROR", "Unauthorized access!!");
    }
  }
  catch (err) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  }
};

exports.getGroupChannel = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const { role } = tokenDecoder(token);
    const { channelName } = req.query;
    const channelData = await GroupChannel.findOne({ channelName: channelName }, {
      conversation: {
        $slice: -50
      }
    }).populate('conversation files');
    if (!channelData) {
      throw new MyError(204, "ERROR", "No channel found!!");
    }
    if (!channelData.isActive && role === "user") {
      return res.status(200).json({
        status: "OK",
        message: "This channel has been deactivated!!",
        channelData: null
      });
    }
    return res.status(200).json({
      status: "OK",
      message: "Channel data has fetched successfully!",
      channelData
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      staus: "ERROR",
      message: err.message || "Somethihg went wrong"
    });
  }
};

exports.addParticipantInChannel = async (req, res) => {
  try {
    const { username } = req.body;
    const { channelName } = req.params;
    const token = getTokenFromHeader(req);
    const { role, workspace } = tokenDecoder(token);
    const user = await User.findOne({ username: username });
    if ((role === "admin" || role === "handler") && (user.workspace === workspace)) {
      const _workspace = await Workspace.findOne({ workspaceName: workspace });
      const isChannelExist = _workspace.channels.find((channel) => channel.name === channelName);
      if (isChannelExist) {
        GroupChannel.findOneAndUpdate({ channelName: channelName }, {
          $addToSet: {
            participants: {
              username: username
            }
          }
        }).then((channel) => {
          User.updateOne({ username: username }, {
            $addToSet: {
              groupChannels: channel.channelName,
              notification: { chatName: channelName, count: 0, lastMessage: 0 }
            },
            workspace
          }).then(() => res.status(200).json({
            status: "OK",
            message: `${username} added successfully to the channel!!`
          }));
        }
        ).catch(
          (err) => res.status(500).json({
            status: "ERROR",
            message: err.message
          })
        );
      } else {
        throw new MyError(404, "ERROR", "Channel not found!!");
      }
    } else if (user.workspace !== workspace) {
      throw new MyError(403, "ERROR", `${username} must be in same worksapce`);
    } else {
      throw new MyError(401, "ERROR", "Unauthorized access!!");
    }
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  }
};

exports.removeParticipantFromChannel = async (req, res) => {
  try {
    const { username } = req.body;
    const { channelName } = req.params;
    const token = getTokenFromHeader(req);
    const { role, workspace } = tokenDecoder(token);
    const user = await User.findOne({ usrname: username });
    if (role === "admin" || role === "handler" && (user.workspace === workspace)) {
      const _workspace = await Workspace.findOne({ workspaceName: workspace });
      const isChannelExist = _workspace.channels.find((channel) => channel.name === channelName);
      if (isChannelExist) {
        GroupChannel.findOneAndUpdate({ channelName: channelName }, {
          $pull: {
            participants: {
              username: username
            },
            notification: { $elemMatch: { name: channelName } }
          }
        }).then(async (channel) => {
          await User.updateOne({ username: username }, {
            $pull: {
              groupChannels: {
                $in: [ channelName ]
              },
              notification: { chatName: channelName }
            }
          });
          return res.status(200).json({
            status: "OK",
            message: `${username} added removed from ${channelName} to the channel!!`
          });
        }).catch(
          (err) => res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          })
        );
      } else {
        throw new MyError(404, "ERROR", "Channel not found!!");
      }
    } else if (user.workspace !== workspace) {
      throw new MyError(403, "ERROR", `${username} must be in same worksapce`);
    } else {
      throw new MyError(401, "ERROR", "Unauthorized access!!");
    }
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  }
};