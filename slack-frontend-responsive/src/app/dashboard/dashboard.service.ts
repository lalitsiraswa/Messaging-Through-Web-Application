import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject, tap} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {ChatserviceService} from '../chat-page/chatservice.service';
import {User} from '../Models/ChannelInfo';
import {AuthenticationServiceService} from '../authentication/authentication-service.service';

type Success = {
  status: String;
  message: String;
};

@Injectable({
  providedIn: 'root',
})
export class DashboardService
{
  public message$ = new Subject<String>();

  URL = 'http://localhost:3000';

  constructor (
    private http: HttpClient,
    private chatService: ChatserviceService,
    private authService: AuthenticationServiceService
  ) { }

  createChannel (channelName: String, description: String, avatarUrl: String)
  {
    console.log(description);

    this.http
      .post<any>(
        `${this.URL}/workspace/add-channel`,
        {
          channelName,
          description,
          avatarUrl,
        },
        {headers: this.chatService.getHeaders()}
      )
      .pipe(
        tap((res: {status: String; channelName: String; message: String;}) =>
        {
          this.chatService.channelsList.unshift({
            name: res.channelName,
            isActive: true,
            lastMessage: 0,
          });
          this.chatService.channelsList$.next(this.chatService.channelsList);
          this.message$.next(res.message);
          this.chatService.socket.emit('create-channel', {
            workspaceName: this.authService.getWorkspace(),
            channelName,
          });
        })
      )
      .subscribe((res: any) =>
      {
        this.chatService.getInfo(res.channelName, false).subscribe();
      });

  }

  toggleChannelStatus (status: Boolean, channelName: String)
  {
    const statusText = status ? 'activate' : 'deactivate';
    this.http
      .post(
        `${this.URL}/workspace/${statusText}-channel?channelName=${channelName}`,
        {},
        {headers: this.chatService.getHeaders()}
      )
      .subscribe((res: any) =>
      {
        this.message$.next(res.message);

        this.chatService.socket.emit('channel-status', {
          channelName,
          isActive: status,
        });
      });
  }

  userChannelStatus (username: String, action: String)
  {
    const channelName = this.chatService.channelName$.value;
    const userList = this.chatService.usersInChannel$.value;
    const users = userList?.map((user: User) => user.username);
    const status = action === 'add' ? 'add' : 'remove';
    const isExist = users?.includes(username);
    if (isExist && status === 'add')
    {
      this.message$.next('User already exist');
    } else
    {
      this.http
        .post<Success>(
          `${this.URL}/workspace/${channelName}/${status}-participant`,
          {username},
          {headers: this.chatService.getHeaders()}
        )
        .pipe(
          tap((res: Success) =>
          {
            if (userList)
            {
              if (status === 'add')
              {
                this.chatService.usersInChannel$.next([
                  ...userList,
                  {username: username, read: true, write: true},
                ]);
                this.message$.next(res.message);
              } else
              {
                this.chatService.usersInChannel$.next(
                  userList.filter((user: User) => user.username !== username)
                );
                this.message$.next(res.message);
              }
              this.chatService.socket.emit('user-channel-status', {
                status,
                channelName,
                username,
              });
            }
          })
        )
        .subscribe();
    }
  }
  handlerStatus (username: String, action: String)
  {
    const status = action === 'add' ? 'add' : 'remove';
    const handlers = this.chatService.handlers;
    const isExistingHandler = handlers.includes(username);
    if (isExistingHandler)
    {
      this.message$.next('handler already exist!!');
    } else
    {
      this.http
        .post<Success>(
          `${this.URL}/workspace/${status}-handler`,
          {username},
          {headers: this.chatService.getHeaders()}
        )
        .pipe(
          tap((res: Success) =>
          {
            if (res.status === 'OK')
            {
              this.chatService.handlers = [...handlers, username];
              this.chatService.handlers$.next(this.chatService.handlers);
              this.message$.next(res.message);
            } else
            {
              this.message$.next(res.message);
            }
          })
        )
        .subscribe();
    }
  }

  userWorkspaceStatus (username: String, action: String)
  {
    const userList = this.chatService.allUsers;
    const isUserExist = userList.includes(username);
    if (isUserExist)
    {
      this.message$.next('User already exist');
    }
    this.chatService.allUsers.push(username);
    this.http
      .post<Success>(
        `${this.URL}/workspace/add-employee`,
        {username},
        {headers: this.chatService.getHeaders()}
      )
      .pipe(
        tap((res: Success) =>
        {
          this.chatService.allUsers$.next(this.chatService.allUsers);
          console.log(res);
          this.message$.next(res.message);
        })
      )
      .subscribe();
  }
}
