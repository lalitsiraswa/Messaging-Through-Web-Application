type WorkspaceInfo = {
  _id: String,
  workspaceName: String,
  owner: String,
  handlers: Array<String>;
  employees: Array<String>,
  channels: Array<Channel>,
  invites: Array<any>;
  createdAt: Date;
};

type DirectMessage = {
  directMessage: Array<Something>;
};

export type Channel = {
  name: String,
  isActive: Boolean,
  lastMessage: Number;
};

export type WorkspaceResponse = {
  message: String,
  payload: {
    directMessage: Array<Something>, result: WorkspaceInfo;
  },
  status: String;
};

export type Something = {username: String, chatId: String;};