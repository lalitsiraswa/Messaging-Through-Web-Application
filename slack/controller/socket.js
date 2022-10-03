const Message = require("../model/message");
const GroupChannel = require("../model/groupChannel");
const User = require("../model/user");
const mongoose = require("mongoose");
const Workspace = require("../model/workspace");
const { Kafka } = require("kafkajs");
const produce = require('./producer');
let onlineUsers = [];

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [ "localhost:9092" ],
});


//Socket Helpers!!

const userActiveStatus = (username, socket, isActive) => {
  User.findOne({ username: username }).then((user) => {
    if (user) {
      user.directMessage.map((friend) => {
        socket.to(friend.username).emit("online-status", { channelName: username, status: isActive });
      });
    }
  });
};

const isUserActive = (username) => {
  const isUserExist = onlineUsers.filter((user) => user.username === username);
  return isUserExist.length ? true : false;
};

const userUpdate = async (destination, chatName, update) => {
  return await User.updateOne({ username: destination, "notification.chatName": chatName }, update);
};

const notificationEmitter = async (socket, destination, chatName, timeStamp, payload) => {
  const update = {
    $inc: { "notification.$.count": 1 },
    $set: { "notification.$.lastMessage": timeStamp }
  };
  const isOnline = isUserActive(destination);
  if (isOnline) {
    socket.to(destination).emit("update-list", { isPrivate: false, chatName });
    const userInfo = await User.findOne({ username: destination });
    const notification = userInfo.notification.filter((notification) => notification.chatName === chatName);
    if (!notification.length) {
      await User.findOneAndUpdate({ username: destination }, {
        $push: {
          notification: {
            chatName,
            count: 1,
            lastMessage: timeStamp
          }
        }
      });
      socket.to(destination).emit("notification", { count: 1, chatName, timeStamp });
    } else {
      socket.to(destination).emit("notification", { count: notification[ 0 ].count + 1, chatName, timeStamp });
    }
  }
  userUpdate(destination, chatName, update);
};

//Socket Logics!!

exports.userRoom = (socket) => {
  socket.on("setup", (username) => {
    socket.emit("multiple-devices", isUserActive(username));
    onlineUsers.push({ username, socket: socket });
    userActiveStatus(username, socket, true);
    socket.join(username);
  });
};


exports.joinChannel = (socket) => {
  socket.on("join-channel", (payload) => {
    const { isPrivateChat, chatId, username } = payload;
    console.log(chatId);
    // const newConsumer = consumerMaker(Date.now().toString());
    // consumer(chatId, socket, isPrivateChat, newConsumer, true);
    socket.join(chatId);
  });
};

exports.leaveChannel = (socket) => {
  socket.on("leave-channel", async (chatId) => {
    socket.leave(chatId);
  });
};

exports.sendNotification = (socket) => {
  socket.on("notification", (payload) => {
    const { isPrivateChat, message, chatId, workspace } = payload;
    const { sender, receiver, timeStamp } = message;
    if (isPrivateChat) {
      notificationEmitter(socket, receiver, sender, timeStamp, payload);
    } else {
      Workspace.findOne({ workspaceName: workspace }).then((fetchedWorkspace) => {
        GroupChannel.findOne({ channelName: receiver }).then((channel) => {
          const channelUsers = channel.participants.map((participant) => participant.username);
          const allUsers = new Set([ fetchedWorkspace.owner, ...fetchedWorkspace.handlers, ...channelUsers ]);
          allUsers.forEach((user) => {
            notificationEmitter(socket, user, receiver, timeStamp, payload);
          });
        });
      });
    }
  });
};

exports.clearNotification = (socket) => {
  socket.on("clear-notification", (payload) => {
    const { chatName, username } = payload;
    const update = {
      $set: { "notification.$.count": 0 }
    };
    userUpdate(username, chatName, update);
  });
};

exports.sendPrivateMessage = (socket) => {
  socket.on("private-message", async (payload) => {
    const { message, chatId } = payload;
    message._id = new mongoose.Types.ObjectId();
    produce(chatId, message, kafka, true);
    socket.to(chatId).emit("private-message", payload);
    socket.to(message.receiver).emit("update-list", { isPrivate: true, chatName: message.receiver });
  });
};

exports.sendGroupMessage = (socket) => {
  socket.on("group-message", (payload) => {
    const { message, chatId } = payload;
    const { sender } = message;
    message._id = new mongoose.Types.ObjectId();
    produce(chatId, message, kafka, false);
    socket.to(chatId).emit("group-message", payload);
  });
};

exports.isUserOnline = (socket) => {
  socket.on("online-status", (payload) => {
    const { sender, userToBeChecked } = payload;
    const isUserOnline = isUserActive(userToBeChecked);
    socket.emit("online-status", { channelName: userToBeChecked, status: isUserOnline });
  });
};

exports.showOnlineToAllFrineds = (socket) => {
  socket.on("login", async (username) => {
    userActiveStatus(username, socket, true);
  });
};

exports.onLogout = (socket) => {
  socket.on("logout", async (username) => {
    console.log(username);
    onlineUsers = onlineUsers.filter((user) => {
      if (user.socket.id != socket.id) {
        return user;
      }
    });
    userActiveStatus(username, socket, false);
  });
};

exports.onDisconnect = (socket) => {
  socket.on("disconnect", (username) => {
    onlineUsers = onlineUsers.filter((user) => {
      if (user.socket.id != socket.id) {
        return user;
      }
    });
    userActiveStatus(username, socket, false);
  });
};

exports.createChannel = (socket) => {
  socket.on("create-channel", (payload) => {
    const { workspaceName, channelName } = payload;
    Workspace.findOne({ workspaceName: workspaceName }).then((workspace) => {
      const rooms = [ workspace.owner, ...workspace.handlers ];
      rooms.map((room) => {
        socket.to(room).emit("create-channel", channelName);
      });
    });
  });
};

exports.channelActiveStatus = (socket) => {
  socket.on("channel-status", async (payload) => {
    const { channelName, isActive } = payload;
    GroupChannel.findOne({ channelName: channelName }).then((channel) => {
      channel.participants.map((user) => {
        socket.to(user.username).emit("channel-status", payload);
      });
    });
  });
};

exports.userChannelStatus = (socket) => {
  socket.on("user-channel-status", (payload) => {
    const { channelName, status, username } = payload;
    const action = status === "add" ? "addde to" : "removed from";
    const newPayload = { channelName, status, username, message: `You have been ${action + " " + channelName.substr(0, channelName.indexOf("@"))} ` };
    socket.to(username).emit("user-channel-status", newPayload);
  });
};

exports.fileUpload = (socket) => {
  socket.on("file-upload", async (payload) => {
    const { chatId } = payload;
    socket.to(chatId).emit("file-upload", payload);
  });
};

exports.fileDelete = (socket) => {
  socket.on("file-delete", async (payload) => {
    const { chatId } = payload;
    socket.to(chatId).emit("file-delete", payload);
  });
};

exports.addHandler = (socket) => {
  socket.on("add-handler", async (payload) => {
    const { username } = payload;
    socket.to(username).emit("add-handler", `added to workspace!!`);
  });
};

// const notificationPayload = {
//   sender: message.sender,
//   chatName: message.sender,
//   timeStamp: message.timeStamp,
//   isPrivate: true
// };
// const notification = new Notification(notificationPayload);
// notification.save();
// 

// const findConsumer = (username) => onlineUsers.filter((user) => {
//   if (user.username === username) {
//     return user;
//   }
// });

// const consumerMaker = (username) => kafka.consumer({ groupId: username });

// const insertNotificationInUser = async (username, _id, newMessage) => {
//   const { sender, timeStamp } = newMessage;
//   await User.updateOne({ username: username }, {
//     $push: { notification: _id }, $set: { "directMessage.$[elem].lastMessage": timeStamp }
//   }, {
//     arrayFilters: [ { "elem.username": sender } ]
//   });
// };

// const privateConsumer = (topicName, socket, isPrivateChat) => {
//   const consumer = kafka.consumer({ groupId: topicName });
//   const consumingLogic = async () => {
//     await consumer.connect();
//     await consumer.subscribe({ topics: [ topicName ] });
//     await consumer.run({
//       eachMessage: ({ topics, partition, message }) => {
//         const parsedMessage = JSON.parse(message.value.toString());

//         // privateMessage(socket, parsedMessage, topicName);
//         const newMessage = new Message(parsedMessage);
//         newMessage._id = new mongoose.Types.ObjectId();
//         newMessage.save();
//         lastMessage(parsedMessage.sender, parsedMessage.receiver, parsedMessage.timeStamp);
//         console.log(newMessage);
//         PersonalChannel.findOneAndUpdate({ _id: topicName }, {
//           $push: {
//             conversation: newMessage._id
//           }
//         }).then(
//           (chatResult) => {
//             this.sendNotification(socket, newMessage.receiver, { notification: newMessage, isPrivate: true, channelId: chatResult._id });
//             socket.to(parsedMessage.receiver).emit("private-message", parsedMessage);
//           }
//         ).catch((err) => {
//           socket.to(parsedMessage.sender).emit("error", err.message);
//         });
//       }
//     });
//   };
//   consumingLogic();
// };

// const consumer = (topicName, socket, isPrivate, consumer, isJoining) => {
//   const consumingLogic = async () => {
//     let messageEvent = isPrivate ? "private" : "group";
//     messageEvent += "-message";
//     const userList = await GroupChannel.findById({ _id: topicName });
//     // const {participants}
//     await consumer.connect();
//     await consumer.subscribe({ topics: [ topicName ] });
//     await consumer.run({
//       eachMessage: ({ topics, partition, message }) => {
//         const parsedMessage = JSON.parse(message.value.toString());
//         // if (isJoining) {
//         //   socket.emit(messageEvent, parsedMessage);
//         // } else {
//         const destination = isPrivate ? parsedMessage.receiver : topicName;
//         if (isPrivate) {
//           socket.to(topicName).emit(messageEvent, parsedMessage);
//         } else {
//           userList.participants.map((user) => {
//             console.log({ userr: user.username });
//             socket.to(topicName).emit(messageEvent, parsedMessage);
//           });
//           console.log("----------------------------------------------------------------");
//         }
//       }
//     });
//   };
//   consumingLogic();
// };