const http = require("http");
const app = require("./app");
const {
  sendGroupMessage,
  sendPrivateMessage,
  joinChannel,
  userRoom,
  leaveChannel,
  onDisconnect,
  isUserOnline,
  onLogout,
  showOnlineToAllFrineds,
  userChannelStatus,
  createChannel,
  channelActiveStatus,
  fileDelete,
  fileUpload,
  sendNotification,
  clearNotification,
} = require("./controller/socket");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origins: "http://localhost:4200",
  },
});
const port = process.env.PORT || 5000;

io.on("connection", (socket) => {
  //User room
  userRoom(socket);

  //For snding message in a group
  sendGroupMessage(socket);

  //For joining a room
  joinChannel(socket);

  //For leaving a room
  leaveChannel(socket);

  //For sending private messages to
  sendPrivateMessage(socket);

  //On disconnecting from server
  onDisconnect(socket);

  //Checking online status of user
  isUserOnline(socket);

  //online status on coming online
  showOnlineToAllFrineds(socket);

  //On Logout
  onLogout(socket);

  //Create Channel Status
  createChannel(socket);

  //User channel status
  userChannelStatus(socket);

  //Channel Active Status
  channelActiveStatus(socket);

  //Upload File
  fileDelete(socket);

  //Delete file
  fileUpload(socket);

  //Send Notification
  sendNotification(socket);

  //Clear Notification 
  clearNotification(socket);
});

server.listen(port, () => {
  console.log(`Server is listening at  port : ${port}`);
});