const mongoose = require('mongoose');
const crypto = require("crypto-js");
const MyError = require("../helper/error");
const { tokenMaker, getTokenFromHeader, tokenDecoder, tokenVerifier } = require("../helper/jwt");
const { sendEmail } = require("../helper/nodemailer");
const User = require("../model/user");
const Workspace = require("../model/workspace");
const Invitation = require("../model/invitation");
const GroupChannel = require("../model/groupChannel");

exports.sendInvite = async (req, res) => {
  const incomingToken = getTokenFromHeader(req);
  const token = tokenDecoder(incomingToken);
  const { username, groupChannels } = req.body;
  const realWorkspace = token.workspace.substr(0, token.workspace.indexOf("@"));
  if (role === "admin" || role === "handler") {
    User.findOne({ username: username }).then(async (result) => {
      if (result.workspace !== null) {
        throw new MyError(409, "ERROR", "Already in workspace");
      }
      const payload = {
        username,
        groupChannels,
        workspace: token.workspace,
        inviteMaker: token.username
      };
      // const hash = crypto.HmacSHA1(payload, process.env.AES_KEY).toString();
      const invite = new Invitation({
        _id: new mongoose.Types.ObjectId(),
        // hash,
        inviteInfo: payload
      });
      invite.save();
      await Workspace.findByIdAndUpdate({ workspaceName: token.workspace }, {
        $addToSet: {
          invites: invite._id
        }
      });
      return result;
    }).then((result) => {
      try {
        sendEmail(result.email, `Invite link for ${token.workspace}`, body);
        return res.status(200).json(({
          status: "OK",
          message: `Email has been sent to ${result.email}`
        }));
      } catch (err) {
        return res.status(500).json({
          status: "ERROR",
          message: err.message
        });
      }
    }).catch((err) => res.status(500).json({
      status: "ERROR",
      message: err.message
    }));
  } else {
    throw new MyError(403, "ERROR", "Unauthorized");
  }
};

exports.addingToWorkspace = async (req, res) => {
  try {
    const { hash } = req.params;
    Invitation.findOneAndDelete({ hash }).then(async (invite) => {
      if (invite === null) {
        throw new MyError(200, "OK", "No data found!");
      }
      const { username, workspace } = invite.inviteInfo;
      const workspaceDetails = await Workspace.findOneAndUpdate({ workspaceName: workspace }, {
        $pull: {
          invites: {
            $in: [ invite._id ]
          }
        },
        $addToSet: {
          employee: username
        },
      });
      return {
        invite, workspaceDetails
      };
    }).then(async (data) => {
      const { invite, workspaceDetails } = data;
      const { username, groupChannels } = invite.inviteInfo;
      const allGroupChannels = [ workspaceDetails.channels[ 0 ], ...groupChannels ];
      allGroupChannels.map(async (groupChannel) => {
        await GroupChannel.findOneAndUpdate({ channelName: groupChannel }, {
          $addToSet: {
            participants: {
              username: username
            }
          }
        });
      });
      return { invite };
    }).then((data) => {
      const { invite } = data;
      const { username, workspace, groupChannels, organization } = invite.inviteInfo;
      User.findOneAndUpdate({ username: username }, {
        $push: {
          groupChannels: {
            $each: groupChannels
          }
        },
        $set: {
          workspace: workspace,
          organization: organization
        },
      });
      return res.status(200).json({
        status: "OK",
        message: "Invited user has been added to respective channels!!"
      });
    }).catch((err) => res.status(err.statusCode || 500).json({
      status: err.status || "ERROR",
      message: err.message
    }));
  } catch (err) {
    return res.status(err.status || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong"
    });
  }
};

exports.generateInviteLink = async (req, res) => {
  try {
    const { groupChannel } = req.body;
    const token = getTokenFromHeader(req);
    const { organization, workspace, username } = tokenDecoder(token);
    const _workspace = await Workspace.findOne({ workspaceName: workspace, organization: organization });
    const allGroupChannels = [ _workspace.channels[ 0 ], groupChannel ];
    const payload = {
      groupChannels: allGroupChannels,
      workspace: _workspace.workspaceName,
      inviteMaker: username,
      organization
    };
    const time = new Date().setHours(+new Date().getHours() + (24 * 7));
    const invite = new Invitation({
      _id: new mongoose.Types.ObjectId(),
      inviteInfo: payload,
      expiresAt: time
    });
    const link = `http://localhost:4200/workspace/public-invite/${invite._id}`;
    invite.save().then(() => res.status(200).json({
      status: "OK",
      message: "invitation link has been generated successfully!!",
      inviteLink: link
    })).catch((err) => res.status(500).json({
      status: "ERROR",
      message: err.message
    }));
  } catch (err) {
    return res.status(err.status || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong!!"
    });
  }
};

exports.requestAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const incomingToken = getTokenFromHeader(req);
    const { username, role } = tokenDecoder(incomingToken);
    if (role !== "user") {
      throw new MyError(403, "ERROR", "Forbidden");
    }
    const invite = await Invitation.findById({ _id: id }).then((invite) => {
      if (invite === null || invite === undefined) {
        throw new MyError(404, "ERROR", "No invite found!");
      } else if (invite.expiresAt < new Date()) {
        throw new MyError(410, "ERROR", "Link has been expired!!");
      }
      Workspace.updateOne({ workspaceName: invite.inviteInfo.workspace }, {
        $addToSet: {
          invites: {
            username: username,
            inviteId: invite._id
          }
        }
      }).then(() => res.status(200).json({
        status: "OK",
        message: "Request has been submitted to the administrators!!"
      })).catch((err) => res.status(500).json({
        status: "ERROR",
        message: err.message
      }));
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong ;("
    });
  }
};