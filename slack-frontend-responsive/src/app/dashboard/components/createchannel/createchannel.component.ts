import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {DashboardService} from '../../dashboard.service';

@Component({
  selector: 'app-createchannel',
  templateUrl: './createchannel.component.html',
  styleUrls: ['./createchannel.component.css']
})
export class CreatechannelComponent implements OnInit
{

  channelForm = new FormGroup({
    channelName: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required, Validators.minLength(30)]),
    avatarUrl: new FormControl("")
  });

  constructor (private dashboard: DashboardService, private chatService: ChatserviceService, private router: Router) { }

  ngOnInit (): void
  {

  }
  onSubmit ()
  {
    const channelName = this.channelForm.get("channelName")?.value;
    const avatarUrl = this.channelForm.get('avatarUrl')?.value;
    const description = this.channelForm.get('description')?.value;
    this.dashboard.createChannel(channelName, description, avatarUrl);
    this.goToHomepage();
  }
  goToHomepage ()
  {
    this.chatService.adminpage = false;
    this.chatService.homepage = true;
    this.chatService.handlerpage = false;
    this.router.navigateByUrl('home');
  }
}
