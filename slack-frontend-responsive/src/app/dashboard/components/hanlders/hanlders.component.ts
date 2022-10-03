import {Component, OnInit} from '@angular/core';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';

@Component({
  selector: 'app-hanlders',
  templateUrl: './hanlders.component.html',
  styleUrls: ['./hanlders.component.css']
})
export class HanldersComponent implements OnInit
{
  handlerList: Array<String> = [];
  showList: Array<String> = [];
  moving: number = 0;
  constructor (private chatservice: ChatserviceService) { }

  ngOnInit (): void
  {
    this.chatservice.handlers$.subscribe((handlers: Array<String>) =>
    {
      this.handlerList = handlers;
      this.showingList(this.moving);
    });
  }
  listContent (action: String)
  {
    this.moving += action === "forward" ? 1 : -1;
    if (this.moving < 0)
    {
      this.moving = 0;
    } else if (this.moving * 10 > this.handlerList.length)
    {
      this.moving = Math.floor(this.handlerList.length / 10);
    }
    this.showingList(this.moving);
  }

  showingList (factor: number)
  {
    this.showList = this.handlerList.slice(factor * 10, (factor + 1) * 10);
  }
}
