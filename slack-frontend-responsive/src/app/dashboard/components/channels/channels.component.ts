import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {Channel} from 'src/app/Models/Workspace';
import {DashboardService} from '../../dashboard.service';

type SomeType = {realName: String, name: String, isActive: Boolean;};
@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})

export class ChannelsComponent implements OnInit
{
  channelsList = Array<SomeType>();
  showList = Array<SomeType>();
  constructor (private chatservice: ChatserviceService, private dashboardService: DashboardService) { }
  moving: number = 0;

  ngOnInit (): void
  {
    this.chatservice.channelsList$.subscribe((channels: Array<Channel> | null) =>
    {
      if (channels)
      {
        this.channelsList = channels.map((channel: Channel) =>
        {
          return {
            realName: channel.name,
            name: channel.name.substring(0, channel.name.indexOf("@")),
            isActive: channel.isActive
          };
        });
        this.showingList(this.moving);
      }
    });

  }

  something (channel: SomeType)
  {
    this.dashboardService.toggleChannelStatus(!channel.isActive, channel.realName);
  }

  listContent (action: String)
  {
    this.moving += action === "forward" ? 1 : -1;
    if (this.moving < 0)
    {
      this.moving = 0;
    } else if (this.moving * 10 > this.channelsList.length)
    {
      this.moving = Math.floor(this.channelsList.length / 10);
    }
    this.showingList(this.moving);

  }

  showingList (factor: number)
  {
    this.showList = this.channelsList.slice(factor * 10, (factor + 1) * 10);
  }

}
