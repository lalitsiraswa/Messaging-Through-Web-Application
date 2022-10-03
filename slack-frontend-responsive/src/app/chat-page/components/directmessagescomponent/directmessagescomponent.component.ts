import {Component, OnInit} from '@angular/core';
import {ChatserviceService} from '../../chatservice.service';
import {Notifications} from 'src/app/Models/Notifications';


type Something = {username: String, chatId: String;};
@Component({
  selector: 'app-directmessagescomponent',
  templateUrl: './directmessagescomponent.component.html',
  styleUrls: ['./directmessagescomponent.component.css']
})
export class DirectmessagescomponentComponent implements OnInit
{
  notifications = Array<Notifications>();
  noticount = 0;
  usersList: Array<Something> = [];
  selectedUserName: String = '';
  first = "a";
  last = "s";

  constructor (private chatService: ChatserviceService) { }

  ngOnInit (): void
  {
    this.chatService.directMessages$.subscribe((res: any) =>
    {
      this.usersList = res;
    });
  }

  openChat (user: Something)
  {
    this.selectedUserName = user.username;
    this.chatService.showAndHideWindow(false);
    this.chatService.getInfo(user.username, true).subscribe();
  }
  selectFromNoti (chatName: String, isPrivate: boolean)
  {
    this.chatService.getInfo(chatName, isPrivate).subscribe();
    // isPrivate ? this.openPrivateChat() : this.openGroupChat();
  }
}
