const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const User = require("../model/user");
const Workspace = require("../model/workspace");
const MyError = require("../helper/error");

const { tokenMaker, tokenDecoder, getTokenFromHeader, } = require("../helper/jwt");
const { sendEmail } = require("../helper/nodemailer");

exports.signUp = async (req, res) => {
  try {
    const { email, password, username, name } = req.body;
    User.findOne({ email: email });
    bcrypt.hash(password, 12).then((result) => new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      password: result,
      email,
      role: "user",
      name
    })).then((result) => {
      const payload = {
        id: result._id,
        username,
        role: result.role,
        workspace: null,
        name: name
      };
      const token = tokenMaker(payload);
      result.save().then(() => res.status(201).json({
        message: "User saved",
        status: "OK",
        token,
        payload
      })).catch((err) => res.status(500).json({
        status: "ERROR",
        message: err.message
      }));
    }).catch((err) => res.status(500).json({
      status: "ERROR",
      message: err.message
    })
    );
  } catch (err) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

exports.logIn = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExist = await User.findOne({ username: username });
    if (!userExist) {
      return res.status(404).json({
        status: "ERROR",
        message: "No such user exist!"
      });
    }

    const result = await bcrypt.compare(password, userExist.password);
    if (!result) {
      throw new MyError(401, "ERROR", "Invalid credentials");
    }
    const payload = {
      id: userExist._id,
      username,
      role: userExist.role,
      workspace: userExist.workspace ? userExist.workspace : null,
      name: userExist.name
    };
    const token = tokenMaker(payload);
    return res.status(200).json({
      status: "OK",
      message: "Loggged in succesfully!!",
      token,
      payload
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      status: err.status,
    });
  }
};

exports.addOtherDetails = async (req, res) => {
  try {
    const { avatarUrl, address, userId } = req.body;
    const token = getTokenFromHeader(req);
    const userDetails = tokenDecoder(token);
    if (userId !== userDetails.id) {
      throw new MyError(401, "ERROR", "Invalid user");
    }
    User.updateOne({ _id: userId }, {
      address,
      avatarUrl
    }).then((user) => res.status(200).json({
      status: "OK",
      message: "Updated successfully"
    })
    ).catch((err) => res.status(err.status).json({
      status: "ERROR",
      message: err.message
    }));
  } catch (err) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.status
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const incomingToken = getTokenFromHeader(req);
    const token = tokenDecoder(incomingToken);
    const { username } = req.params;
    const { filter } = req.query;
    const reg = new RegExp(username, "g");

    const queryForWorkspaceUsers = [ { username: { $ne: token.username } }, { username: reg, workspace: token.workspace } ];
    const queryForAllUserExceptWorkspaceUsers = [ { username: { $ne: token.username } }, { username: reg, $and: [ { workspace: { $ne: token.workspace } }, { workspace: null } ] } ];
    const query = filter === "1" ? queryForWorkspaceUsers : queryForAllUserExceptWorkspaceUsers;

    User.find({ $and: query }).limit(10).then((result) => {
      const array = result.map((user) => {
        return { username: user.username };
      });
      return res.status(200).json({
        status: "OK",
        message: "Users",
        payload: array
      });
    }).catch((err) => res.status(500).json({
      status: "ERROR",
      message: err.message
    }));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: err.status || "ERROR",
      message: err.message || "Internal server error!"
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { username } = req.params;
    User.findOne({ username: username }).then((result) => {
      if (result !== null) {
        return res.status(200).json(({
          status: "OK",
          message: "User fetched successfully",
          payload: result.username
        }));
      }
      throw new MyError(404, "ERROR", "No such user exist!!");
    }).catch((err) => res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong"
    }));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message || "Internal server error!"
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { username } = req.body;
  User.findOne({ username: username }).exec().then((result) => {
    const payload = { username: username };
    const resetToken = tokenMaker(payload, '10m');
    const resetLink = "http://localhost:4200/forgot-password/" + resetToken;
    const body = `<h2>Hi, ${result.username}</h2>
                    <div>Click on the below button to change your password, it will be valid for <strong>10 minutes only!!</strong></div>;
                    <a href=${resetLink}> Reset password </a>
                    <div>Thanks, team 405 Found</div>`;
    sendEmail(result.email, "Pasword reset link", body);
    return res.status(200).json({
      status: "OK",
      message: `Passwrord reset link has been sent to ${result.email}`
    });
  }).catch((err) => res.status(err.statusCode || 500).json({
    status: err.status || "ERROR",
    message: err.message || "Something went wrong"
  })
  );
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      status: "ERROR",
      message: err.message
    });
  }
  if (token) {
    const { username } = tokenDecoder(token);
    const { password } = req.body;
    bcrypt.hash(password, 12).then(async (hashedResult) => await User.findOneAndUpdate({ username: username }, { password: hashedResult })
    ).then((user) => res.status(200).json({
      status: "OK",
      message: "Your password has been updated!!"
    })).catch((error) => res.status(500).json({
      status: "ERROR",
      message: error.message
    }));
  }
  else {
    return res.status(403).json({
      status: "ERROR",
      message: "Unauthorized Access!!"
    });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const { username } = req.params;
    const token = getTokenFromHeader(req);
    const { workspace } = tokenDecoder(token);
    const userInfo = await User.findOne({ username });
    const workspaceDetails = await Workspace.findOne({ workspaceName: workspace });
    const channels = workspaceDetails.channels.filter((channel) => {
      if (userInfo.groupChannels.includes(channel.name)) {
        return channel;
      }
    }).sort((a, b) => -(a.lastMessage - b.lastMessage));
    const userPayload = {
      username: userInfo.username,
      name: userInfo.name,
      role: userInfo.role,
      workspace: userInfo.workspace,
      directMessage: userInfo.directMessage.sort((a, b) => -(a.lastMessage - b.lastMessage)),
      notification: userInfo.notification.sort((a, b) => -(a.lastMessage - b.lastMessage)),
      groupChannels: channels,
      email: userInfo.email
    };
    return res.status(200).json({
      status: "OK",
      message: "User details has been fetched!!",
      payload: { userInfo: userPayload }
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: "ERROR",
      mesasge: err.message || "Something went wrong"
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { skip } = req.query;
    const token = getTokenFromHeader(req);
    const { username } = tokenDecoder(token);
    const notifications = await User.findOne({ username: username }, {
      notification: {
        $slice: [ -1, 10 ]
      }
    }).populate("notification").then(console.log);
    return res.status(200).json({ notifications });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message
    });
  }
};