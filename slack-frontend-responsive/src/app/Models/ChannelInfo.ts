import {Files} from "./File";
import {Message} from "./Message";

export type ChannelInfo = {
    status: String,
    message: String,
    channelData: ChannelData;
    // isActive: Boolean
};

type ChannelData = {
    _id: String,
    channelName: String,
    conversation: Array<Message>,
    createdAt: String,
    description: String,
    files: Array<Files>,
    isActive: boolean,
    participants: Array<User>;
};

export type User = {
    username: String,
    read: boolean,
    write: boolean;
};
