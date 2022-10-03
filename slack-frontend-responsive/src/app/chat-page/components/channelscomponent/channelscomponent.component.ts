import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthenticationServiceService} from 'src/app/authentication/authentication-service.service';
import {Channel} from 'src/app/Models/Workspace';
import {ChatserviceService} from '../../chatservice.service';
import {ModalComponent} from '../modal/modal.component';
import {Notifications} from 'src/app/Models/Notifications';

@Component({
  selector: 'app-channelscomponent',
  templateUrl: './channelscomponent.component.html',
  styleUrls: ['./channelscomponent.component.css']
})
export class ChannelscomponentComponent implements OnInit
{
  notifications = Array<Notifications>();
  noticount = 0;
  selectedChannel: String = '';
  channelsList: Array<{realName: String, name: String, isActive: Boolean, lastMessage: Number;}> = [];
  selectedchannel: any = null;

  constructor (private chatService: ChatserviceService, private dialog: MatDialog, private authService: AuthenticationServiceService)
  {
    this.chatService.channelsList$.subscribe((channels: Array<Channel> | null) =>
    {
      if (channels)
      {
        this.channelsList = channels.map((channel: Channel) =>
        {
          return {
            name: channel.name.substring(0, channel.name.indexOf("@")),
            realName: channel.name,
            isActive: channel.isActive,
            lastMessage: channel.lastMessage
          };
        });
        this.channelsList.sort((a: Channel, b: Channel) => ((b.lastMessage as number) - (a.lastMessage as number)));
      }
    });
  }

  openDialog ()
  {
    this.dialog.open(ModalComponent);
  }

  ngOnInit (): void
  {
    this.chatService.channelName$.subscribe((channel: String) =>
    {
      this.selectedChannel = channel;
      this.chatService.isPrivateChat = false;
    });
  }

  onSelectChannel (channelName: String)
  {
    this.selectedChannel = channelName;
    this.chatService.showAndHideWindow(false);
    this.chatService.isPrivateChat = false;
    const channel = channelName.toString();
    this.chatService.getInfo(channelName, false).subscribe();
    this.chatService.disconnectChannel();
    if (this.selectedchannel)
    {
      if (document.getElementById(this.selectedchannel))
      {
        let temp = document.getElementById(this.selectedchannel);
        if (temp)
        {
          temp.style.background = "#fff";
        }
      }
      this.selectedchannel = channelName;
      let temp = document.getElementById(channel);
      if (temp)
      {
        temp.style.background = "#eee";
      }
    }
    else
    {
      this.selectedchannel = channelName;
      let temp = document.getElementById(channel);
      if (temp)
      {
        temp.style.background = "#eee";
      }
    }
  }
  selectFromNoti (chatName: String, isPrivate: boolean)
  {
    this.chatService.getInfo(chatName, isPrivate).subscribe();
    // isPrivate ? this.openPrivateChat() : this.openGroupChat();
  }
}
