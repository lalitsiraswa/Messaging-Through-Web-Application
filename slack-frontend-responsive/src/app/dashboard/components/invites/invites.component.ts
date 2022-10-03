import {Component, OnInit} from '@angular/core';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.css']
})
export class InvitesComponent implements OnInit
{

  invites: Array<any> = ["!"];

  constructor (private chatService: ChatserviceService) { }

  ngOnInit (): void
  {
    this.chatService.invites$.subscribe((invites: Array<any>) =>
    {
      // this.invites = invites;
    })
  }

}
