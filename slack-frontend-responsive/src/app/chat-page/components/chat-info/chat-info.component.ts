import {Component, OnInit} from '@angular/core';
import {AuthenticationServiceService} from 'src/app/authentication/authentication-service.service';
import {DashboardService} from 'src/app/dashboard/dashboard.service';
import {User} from 'src/app/Models/ChannelInfo';
import {Channel} from 'src/app/Models/Workspace';
import {ChatserviceService} from '../../chatservice.service';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css'],
})
export class ChatInfoComponent implements OnInit
{

  searchedUsers: Array<{username: String;}> = Array<{username: String;}>();
  usersList: Array<User> = Array<User>();
  channelsList: Array<String> = Array<String>();

  channelName: String = "";
  searchTerm: String = "";
  timeout: any = null;
  privateChat: any = true;
  roleOfUser: any = true;

  constructor (private chatService: ChatserviceService, private dashboardService: DashboardService, private authservice: AuthenticationServiceService)
  {
  }
  ngOnInit (): void
  {
    this.roleOfUser = this.authservice.getRoleOfUser() == 'user';
    this.chatService.channelName$.subscribe((channel: String | null) =>
    {
      if (channel)
      {
        this.channelName = channel.substring(0, channel.indexOf("@"));
      }
    });
    this.chatService.usersInChannel$.subscribe((users) =>
    {
      if (users)
      {
        this.usersList = users;
      }
    });
    this.privateChat = this.chatService.isPrivateChat;
  }

  onKeySearch (event: any)
  {
    const value = event.target.value;
    if (value)
    {
      clearTimeout(this.timeout);
      const $this = this;
      this.timeout = setTimeout(function ()
      {
        if (event.keyCode != 13)
        {
          $this.searchUser(event.target.value);
        }
      }, 300);
    } else
    {
      this.searchedUsers = Array<{username: String;}>();
    }
  }

  searchUser (username: String)
  {
    this.chatService.getListOfSearchedUser(username, "1");
    this.chatService.searchedUsers$.subscribe(
      (res: Array<{username: String;}> | null) =>
      {
        if (res)
        {
          this.searchedUsers = res;
        }
      }
    );
  }

  userStatus (username: String, action: String)
  {
    this.dashboardService.userChannelStatus(username, action);
  }

}
