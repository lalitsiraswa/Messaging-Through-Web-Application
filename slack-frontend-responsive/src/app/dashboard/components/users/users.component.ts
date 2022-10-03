import {Component, OnInit} from '@angular/core';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit
{

  users: any = [];
  moving: number = 0;
  showList: any = [];

  constructor (private chatservice: ChatserviceService) { }

  ngOnInit (): void
  {
    this.chatservice.allUsers$.subscribe((users: Array<String>) =>
    {
      this.users = users;
      this.showingList(this.moving);
    });
  }
  listContent (action: String)
  {
    this.moving += action === "forward" ? 1 : -1;
    if (this.moving < 0)
    {
      this.moving = 0;
    } else if (this.moving * 10 > this.users.length)
    {
      this.moving = Math.floor(this.users.length / 10);
    }
    this.showingList(this.moving);
  }

  showingList (factor: number)
  {
    this.showList = this.users.slice(factor * 10, (factor + 1) * 10);
  }

}
