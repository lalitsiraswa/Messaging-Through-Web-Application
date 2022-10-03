import {Injectable} from '@angular/core';
import {BehaviorSubject, from, map, Observable, of, Subject, tap} from 'rxjs';
import * as io from 'socket.io-client';
import {AuthenticationServiceService} from '../authentication/authentication-service.service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Message} from '../Models/Message';
import {ChannelInfo} from '../Models/ChannelInfo';
import {User} from '../Models/ChannelInfo';
import {Router} from '@angular/router';
import {SearchUserList} from '../Models/SearchUserList';
import {Channel, WorkspaceResponse} from '../Models/Workspace';
import {Something} from '../Models/Workspace';
import {Noti, Notifications} from '../Models/Notifications';
import {Files} from '../Models/File';
//
@Injectable({
  providedIn: 'root',
})
export class ChatserviceService
{
  // showLeftComponent: boolean = true;
  // showRightComponent: boolean = true;
  public fileMessage$ = new Subject<String>();
  public noChatsAvailable$ = new Subject<String>();
  public notify = new Subject<any>();
  showAndHide: boolean = true;
  showAndHide$ = new BehaviorSubject<boolean>(true);
  homepage = true;
  adminpage = false;
  handlerpage = false;

  channelName: String = '';
  isPrivateChat: Boolean = false;

  userName$ = new BehaviorSubject<String>(
    this.authService.getUserNameFromStorage()
  );

  URL: String = 'http://localhost:3000';
  skip: any = 1;

  messageList: Array<Message> = [];
  channelsList: Array<Channel> = [];
  invites: Array<any> = [];
  allUsers: Array<String> = [];
  handlers: Array<String> = [];
  directMessages: Array<Something> = [];
  socket: any;
  chatId: String = '';
  notification: Array<Notifications> = Array<Notifications>();
  files: Array<Files> = Array<Files>();
  isChannelActive: boolean = false;
  previousId: String = '';

  public loadMoreMessages = new Subject<Boolean>();
  progressBar$ = new BehaviorSubject<any>(0);
  closeProgressBar$ = new BehaviorSubject<any>(false);
  isUserRemoved$ = new BehaviorSubject<boolean>(false);
  noData$ = new BehaviorSubject<Boolean>(false);
  userActive$ = new BehaviorSubject<Boolean>(false);
  files$ = new BehaviorSubject<Array<Files>>([]);
  notification$ = new BehaviorSubject<Array<Notifications>>([]);
  invites$ = new BehaviorSubject<Array<any>>([]);
  allUsers$ = new BehaviorSubject<Array<String>>([]);
  directMessages$ = new BehaviorSubject<Array<Something>>([]);
  handlers$ = new BehaviorSubject<Array<String>>([]);
  usersInChannel$ = new BehaviorSubject<Array<User> | null>(null);
  messageList$ = new BehaviorSubject<Array<Message> | null>(null);
  channelsList$ = new BehaviorSubject<Array<Channel> | null>(null);
  channelName$ = new BehaviorSubject<String>('');
  notificationCount = new BehaviorSubject<number>(0);
  searchedUsers$ = new BehaviorSubject<Array<{username: String;}> | null>(null);
  isLoading$ = new BehaviorSubject(true);
  description$ = new BehaviorSubject<String>('XYZ');
  multipleDevices$ = new BehaviorSubject<Boolean>(false);
  allMessages$ = new BehaviorSubject<Array<Files | Message>>([]);

  public channelSearch = new BehaviorSubject<String>('');
  public handlerSearch = new BehaviorSubject<String>('');
  public allUserSearch = new BehaviorSubject<String>('');

  constructor (
    private authService: AuthenticationServiceService,
    private http: HttpClient,
    private router: Router
  ) { }

  showAndHideWindow (value: boolean)
  {
    this.showAndHide = value;
    this.showAndHide$.next(this.showAndHide);
  }

  getHeaders (): HttpHeaders
  {
    const token = this.authService.getTokenFromStoarge();
    const header = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    return header;
  }

  getUserData ()
  {
    this.userName$.next(this.authService.getUserNameFromStorage());
    this.isLoading$.next(true);
    return this.http
      .get(
        this.URL + `/user-info/${this.authService.getUserNameFromStorage()}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap((res: any) =>
        {
          const {groupChannels, directMessage, notification} =
            res.payload.userInfo;
          this.notification = notification;
          this.notification$.next(notification);
          this.channelsList = groupChannels;
          this.channelsList$.next(groupChannels);
          this.directMessages = directMessage;
          this.directMessages$.next(directMessage);
          this.isLoading$.next(false);
        })
      );
  }

  getListOfSearchedUser (username: String, filter: String)
  {
    return this.http
      .get<SearchUserList>(`${this.URL}/users/${username}?filter=${filter}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((res: SearchUserList) =>
        {
          this.searchedUsers$.next(res.payload);
        })
      )
      .subscribe();
  }

  getInfo (channelName: String, isPrivateChat: boolean)
  {
    this.isUserRemoved$.next(false);
    this.isLoading$.next(true);
    const username = this.authService.getUserNameFromStorage();
    const payload = {chatName: channelName, username};
    this.clearNotification(payload);
    this.isPrivateChat = isPrivateChat;
    if (isPrivateChat)
    {
      const sender = username ? username : '';
      this.userActiveStatus(sender, channelName, false);
      return this.http.get<ChannelInfo>(this.URL + `/direct-message/?sender=${sender}&receiver=${channelName}`, {
        headers: this.getHeaders()
      }).pipe(
        tap(
          (res: ChannelInfo) =>
          {
            const {channelName, participants, conversation, _id, files} = res.channelData;
            this.connectToChannel(_id, true);
            this.channelName = channelName;
            this.channelName$.next(channelName);
            this.usersInChannel$.next(participants);
            this.messageList = conversation;
            this.files = files;
            this.files$.next(files);
            this.chatId = _id;
            this.messageList$.next(this.messageList);
            this.isPrivateChat = true;
            this.allMessageHelper();
            const isExist = this.directMessages.find(
              (user) => user.username === channelName
            );
            if (!isExist)
            {
              this.directMessages.push({username: channelName, chatId: _id});
            }
            this.directMessages$.next(this.directMessages);
            this.isLoading$.next(false);
          })
      );
    } else
    {
      return this.http
        .get<ChannelInfo>(
          this.URL + `/workspace/channel?channelName=${channelName}`,
          {
            headers: this.getHeaders(),
          }
        )
        .pipe(
          tap((res: ChannelInfo) =>
          {
            if (res.channelData)
            {
              const {
                channelName,
                participants,
                conversation,
                _id,
                isActive,
                files,
                description,
              } = res.channelData;
              const allMessages = [...conversation, ...files];
              this.isPrivateChat = false;
              this.isChannelActive = isActive;
              this.chatId = _id;
              this.description$.next(description);
              this.channelName = channelName;
              this.channelName$.next(channelName);
              this.usersInChannel$.next(participants);
              this.files = files;
              this.files$.next(files);
              this.messageList = conversation;
              this.messageList$.next(this.messageList);
              this.noData$.next(false);
              this.allMessages$.next(
                allMessages.sort(
                  (a: Files | Message, b: Files | Message) =>
                    (a.timeStamp as number) - (b.timeStamp as number)
                )
              );
              // console.log(allMessages.map((x: Files | Message) => console.log(x.extension)));
              this.allMessageHelper();
              this.connectToChannel(_id, false);
            } else
            {
              this.noData$.next(true);
            }
            this.isLoading$.next(false);
          })
        );
    }
  }

  getWorkspaceInfo ()
  {
    const workspace = this.authService.getWorkspace();
    this.userName$.next(this.authService.getUserNameFromStorage());
    this.http
      .get<WorkspaceResponse>(`${this.URL}/workspace?workspace=${workspace}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((res: WorkspaceResponse) =>
        {
          const {directMessage, result} = res.payload;
          this.handlers = result.handlers;
          this.handlers$.next(this.handlers);
          this.directMessages = directMessage;
          this.directMessages$.next(directMessage);
          this.channelsList = result.channels;
          this.channelsList$.next(result.channels);
          this.invites = result.invites;
          this.invites$.next(result.invites);
          this.allUsers = result.employees;
          this.allUsers$.next(result.employees);
        })
      )
      .subscribe();
  }

  postFile (file: any)
  {
    let channel;
    this.channelName$.subscribe((channelName: String | null) =>
    {
      channel = channelName;
    });
    const form = new FormData();
    form.append('file', file.target.files[0]);
    this.http
      .post<any>(
        `${this.URL}/upload?groupName=${this.isPrivateChat ? this.chatId : channel
        }&isPrivate=${this.isPrivateChat ? '1' : '0'}`,
        form,
        {
          reportProgress: true,
          observe: 'events',
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap((res: any) =>
        {
          if (res['loaded'] && res['total'])
          {
            let val = Math.round((res['loaded'] / res['total']) * 100);
            this.progressBar$.next(val);
          } else
          {
            if (res.body)
            {
              const file = res.body.file;
              this.onFileUpload(file);
              this.fileMessage$.next(res.body.message);
              this.closeProgressBar$.next(true);
              setTimeout(() =>
              {
                this.fileMessage$.next('');
                this.closeProgressBar$.next(false);
                this.progressBar$.next(0);
              }, 1000);
              this.files.push(file);
              this.files$.next(this.files);
              this.allMessageHelper();
            }
          }
        })
      )
      .subscribe();
  }

  downloadFile (file: Files)
  {
    const {fileKey, fileType} = file;
    this.http
      .get<any>(`${this.URL}/download-file?id=${fileKey}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((res: any) =>
        {
          window.open(
            `https://kloudchat.s3.ap-south-1.amazonaws.com/${fileKey}`
          );
        })
      )
      .subscribe();
  }

  deleteFile (file: Files)
  {
    const {fileKey} = file;
    const updatedFilesArray = this.files.filter(
      (file: Files) => file.fileKey !== fileKey
    );
    this.http
      .delete<any>(
        `${this.URL}/delete-file?id=${fileKey}&groupName=${this.channelName
        }&isPrivate=${this.isPrivateChat
        }&username=${this.userName$.getValue()}`,
        {headers: this.getHeaders()}
      )
      .pipe(
        tap((res: any) =>
        {
          this.onFileDelete(file);
          this.files = updatedFilesArray;
          this.files$.next(this.files);
        })
      )
      .subscribe();
  }

  connect ()
  {
    const URL = `http://localhost:3000/`;

    this.socket = io.io(URL, {autoConnect: true});
    this.socket.emit('setup', this.authService.getUserNameFromStorage());
    this.sendOnlineStatusToFriends(this.userName$.getValue());
    this.socket.on(
      'notification',
      (payload: {chatName: String; lastMessage: Number; count: Number}) =>
      {
        const {chatName, lastMessage, count} = payload;
        const previousNotifications = this.notification$
          .getValue()
          .filter(
            (notification: Notifications) => notification.chatName !== chatName
          );
        if (this.channelName !== chatName)
        {
          this.notify.next(`You have ${count} new messages in ${chatName}`);
          this.notification = [payload, ...previousNotifications];
        } else
        {
          this.notification = previousNotifications;
        }
        this.notification$.next(this.notification);
      }
    );

    this.socket.on('group-message', (payload: any) =>
    {
      const {message, chatId, isActive} = payload;
      if (this.chatId === chatId)
      {
        this.messageList.push(message);
        this.messageList$.next(this.messageList);
      }
      this.allMessageHelper();
    });

    this.socket.on('private-message', (payload: any) =>
    {
      const {message, chatId} = payload;
      if (this.chatId === chatId)
      {
        this.messageList.push(message);
        this.messageList$.next(this.messageList);
      }
      this.allMessageHelper();
    });

    this.socket.on(
      'online-status',
      (payload: {channelName: String; status: Boolean}) =>
      {
        const {channelName, status} = payload;
        this.channelName$.subscribe((channel: String) =>
        {
          if (channel === channelName)
          {
            this.userActive$.next(status);
          }
        });
      }
    );

    this.socket.on('create-channel', (channelName: String) =>
    {
      this.channelsList.push({
        name: channelName,
        isActive: true,
        lastMessage: Date.now(),
      });
      this.channelsList$.next(this.channelsList);
    });

    this.socket.on('user-channel-status', (payload: any) =>
    {
      const {status, message, channelName, username} = payload;
      const channels = this.channelsList;
      if (status === 'add')
      {
        this.channelsList = [
          {name: channelName, isActive: true, lastMessage: Date.now()},
          ...channels,
        ];
        this.isUserRemoved$.next(false);
        this.channelsList$.next(this.channelsList);
      } else
      {
        this.channelsList = channels.filter(
          (channel: Channel) => channel.name !== channelName
        );
        if (this.channelName === channelName)
        {
          this.isUserRemoved$.next(true);
        }
        this.channelsList$.next(this.channelsList);
      }
    });

    this.socket.on(
      'channel-status',
      (payload: {channelName: String; isActive: Boolean}) =>
      {
        if (this.channelName === payload.channelName)
        {
          this.noData$.next(!payload.isActive);
        }
      }
    );

    this.socket.on('multiple-devices', () =>
    {
      this.multipleDevices$.next(true);
    });

    this.socket.on('file-upload', (payload: any) =>
    {
      const {chatId, file} = payload;
      if (this.chatId === chatId)
      {
        this.files.push(file);
        this.files$.next(this.files);
      }
      this.allMessageHelper();
    });

    this.socket.on('file-delete', (payload: any) =>
    {
      const {chatId, file} = payload;
      const updatedFiles = this.files.filter(
        (oldFiles: Files) => oldFiles.fileKey !== file.fileKey
      );
      if (this.chatId === chatId)
      {
        this.files = updatedFiles;
        this.files$.next(this.files);
      }
      this.allMessageHelper();
    });

    this.socket.on('update-list', (payload: any) =>
    {
      const {isPrivate, chatName} = payload;
      if (isPrivate)
      {
        let obj: Something = {username: '', chatId: ''};
        const updatedList: Array<Something> = [];
        this.directMessages.map((dm: Something) =>
        {
          if (dm.username !== chatName)
          {
            updatedList.push(dm);
          } else
          {
            obj = dm;
          }
        });
        this.directMessages = [obj, ...updatedList];
        this.directMessages$.next(this.directMessages);
      } else
      {
        let Object: Channel = {name: '', isActive: true, lastMessage: 0};
        const updatedList: Array<Channel> = [];
        this.channelsList.map((ch: Channel) =>
        {
          if (ch.name !== chatName)
          {
            updatedList.push(ch);
          } else
          {
            Object = ch;
          }
        });
        this.channelsList = [Object, ...updatedList];
        this.channelsList$.next(this.channelsList);
      }
    });
  }

  getMessage (skip: number)
  {
    const channel = this.isPrivateChat ? 'private' : 'group';
    const channelName = this.isPrivateChat ? this.chatId : this.channelName;
    console.log(skip);

    this.http
      .get<any>(
        `${this.URL}/${channel}-message?skip=${skip}&groupName=${channelName}`,
        {headers: this.getHeaders()}
      )
      .pipe(
        tap((res: any) =>
        {
          if (res.conversation.length)
          {
            this.messageList = [...res.conversation, ...this.messageList];
            this.messageList$.next(this.messageList);
            this.allMessageHelper();
          } else
          {
            this.loadMoreMessages.next(false);
            this.noChatsAvailable$.next('No more chats available');
          }
        })
      )
      .subscribe();
  }

  sendMessage (textMessage: String)
  {
    const isPrivate = this.isPrivateChat;
    const sender = this.authService.getUserNameFromStorage();
    const receiver = this.channelName$.value ? this.channelName$.value : '';
    const chatId = this.chatId;
    const username = this.userName$.getValue();
    const message = {
      sender,
      receiver,
      textMessage,
      timeStamp: Date.now(),
      extension: 'txt',
    };
    const payload = {
      message,
      chatId: this.chatId,
      isPrivateChat: this.isPrivateChat,
      workspace: this.authService.getWorkspace(),
    };
    this.sendNotification(payload);
    if (!isPrivate)
    {
      this.socket.emit('group-message', payload);
    } else
    {
      this.socket.emit('private-message', {message, chatId: this.chatId});
    }
    this.messageList.push(message);
    this.messageList$.next(this.messageList);
    this.allMessageHelper();
  }

  userActiveStatus (
    sender: String,
    userToBeChecked: String,
    showOffline: Boolean
  )
  {
    this.socket.emit('online-status', {sender, userToBeChecked, showOffline});
  }

  disconnectChannel ()
  {
    this.socket.emit('leave-channel', {
      chatId: this.previousId,
      username: this.userName$.getValue(),
    });
  }

  connectToChannel (channelName: String, isPrivateChat: Boolean)
  {
    this.socket.emit('join-channel', {
      channelName,
      isPrivateChat,
      username: this.userName$.getValue(),
      chatId: channelName,
    });
  }

  leaveChannel (chatId: String)
  {
    this.socket.emit('leave-channel', chatId);
  }

  onLogout ()
  {
    this.socket.emit('logout', this.authService.getUserNameFromStorage());
  }
  sendOnlineStatusToFriends (username: String)
  {
    this.socket.emit('login', username);
  }

  onFileUpload (file: Files)
  {
    this.socket.emit('file-upload', {chatId: this.chatId, file});
    const payload = {
      isPrivateChat: this.isPrivateChat,
      message: {
        sender: this.authService.getNameFromStorage(),
        receiver: this.channelName,
        timeStamp: Date.now(),
      },
      workspace: this.authService.getWorkspace(),
      chatId: this.chatId,
    };
    this.sendNotification(payload);
  }

  onFileDelete (file: Files)
  {
    this.socket.emit('file-delete', {chatId: this.chatId, file});
    const payload = {
      isPrivateChat: this.isPrivateChat,
      message: {
        sender: this.authService.getNameFromStorage(),
        receiver: this.channelName,
        timeStamp: Date.now(),
      },
      workspace: this.authService.getWorkspace(),
      chatId: this.chatId,
    };
    this.sendNotification(payload);
  }

  sendNotification (payload: any)
  {
    this.socket.emit('notification', payload);
  }

  clearNotification (payload: any)
  {
    this.notification$.next(
      this.notification.filter(
        (notification: Notifications) =>
          notification.chatName !== payload.chatName
      )
    );
    this.socket.emit('clear-notification', payload);
  }

  clear ()
  {
    this.messageList = [];
    this.channelsList = [];
    this.invites = [];
    this.allUsers = [];
    this.handlers = [];
    this.directMessages = [];
    this.chatId = '';
    this.socket = '';
    this.notification = Array<Notifications>();
    this.userName$.next('');
    this.userActive$.next(false);
    this.notification$.next([]);
    this.invites$.next([]);
    this.allUsers$.next([]);
    this.directMessages$.next([]);
    this.handlers$.next([]);
    this.usersInChannel$.next([]);
    this.messageList$.next([]);
    this.channelsList$.next(null);
    this.channelName$.next('');
    this.searchedUsers$.next(null);
    this.multipleDevices$.next(false);
  }

  allMessageHelper ()
  {
    const allMessages = [...this.files, ...this.messageList];
    this.allMessages$.next(
      allMessages.sort(
        (a: Files | Message, b: Files | Message) =>
          (a.timeStamp as number) - (b.timeStamp as number)
      )
    );
  }

  invitelink (id: any)
  {
    this.http
      .post(`/public-invite/${id}`, {headers: this.getHeaders()})
      .subscribe((res: any) =>
      {
        this.router.navigateByUrl('home');
      });
  }
}
//
