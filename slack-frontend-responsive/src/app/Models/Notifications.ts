export type Noti = {
  _id: String,
  receiver: String,
  sender: String,
  textMessage: String,
  timeStamp: Number,
  __v: Number;
};

export type Notifications = {
  chatName: String,
  count: Number,
  lastMessage: Number;
};
