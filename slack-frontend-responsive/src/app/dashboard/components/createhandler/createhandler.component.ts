import {Component, OnInit} from '@angular/core';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {DashboardService} from '../../dashboard.service';

@Component({
  selector: 'app-createhandler',
  templateUrl: './createhandler.component.html',
  styleUrls: ['./createhandler.component.css']
})
export class CreatehandlerComponent implements OnInit
{

  usersList: any = [];
  timeout: any;
  searchedUsers: Array<{username: String;}> = [];

  constructor (private chatService: ChatserviceService, private dashboardService: DashboardService) { }

  ngOnInit (): void { }

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

  addHandler (username: any)
  {

    this.dashboardService.handlerStatus(username, "add");
  }

}
