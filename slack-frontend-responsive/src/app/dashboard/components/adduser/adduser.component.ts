import {Component, OnInit} from '@angular/core';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {DashboardService} from '../../dashboard.service';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit
{

  searchedUsers: Array<{username: String;}> = [{username: "Example1"}, {username: "Example2"}];
  searchTerm: String = "";
  timeout: any;
  constructor (private chatService: ChatserviceService, private dashboardService: DashboardService) { }

  ngOnInit (): void
  {
    // this.chatService.getListOfAllUsers().subscribe((res: any) => {
    //   this.usersList = res;
    // })

  };

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
    this.chatService.getListOfSearchedUser(username, "0");
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
    this.dashboardService.userWorkspaceStatus(username, action);
    console.log(username);

  }
}
// 