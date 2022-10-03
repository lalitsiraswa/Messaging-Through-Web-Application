import {Component, OnInit} from '@angular/core';
import {Route, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AuthenticationServiceService} from 'src/app/authentication/authentication-service.service';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {DashboardService} from '../../dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit
{
  selected_option: String = 'channel-list';
  channel = true;
  hanlder = false;
  invite = false;
  user = false;
  addUser = false;
  addHanlder = false;
  createChannel = false;
  message: any = '';
  userName: String | null = '';
  lettersOfUsername: String = '';

  constructor (
    private authservice: AuthenticationServiceService,
    private router: Router,
    private chatservice: ChatserviceService,
    private dashboard: DashboardService,
    private toastr: ToastrService
  ) { }

  ngOnInit (): void
  {
    this.chatservice.getWorkspaceInfo();
    this.userName = this.authservice.getNameFromStorage();

    let temp: any = this.userName?.split(' ');
    if (temp)
    {
      if (!this.chatservice.socket)
      {
        this.chatservice.connect();
      }
      for (let ob of temp)
      {
        this.lettersOfUsername += ob[0];
      }
    }

    this.dashboard.message$.subscribe((res: String) =>
    {
      this.message = res;
      this.showSuccess();
      setTimeout(() =>
      {
        this.message = '';
      }, 2000);
    });
  }

  showSuccess ()
  {
    this.toastr.success(this.message);
  }

  channelList ()
  {
    this.selected_option = 'channel-list';
    this.channel = true;
    this.hanlder = this.invite = this.user = false;
    this.addUser = false;
    this.addHanlder = false;
    this.createChannel = false;
  }

  hanlderList ()
  {
    this.selected_option = 'handlers-list';
    this.hanlder = true;
    this.channel = this.invite = this.user = false;
    this.addUser = false;
    this.addHanlder = false;
    this.createChannel = false;
  }

  // inviteComponet() {
  //   this.invite = true;
  //   this.hanlder = this.channel = this.user =false;
  //   this.addUser = false;
  //   this.addHanlder = false;
  //   this.createChannel = false;
  // }

  userComponent ()
  {
    this.selected_option = 'users-list';
    this.user = true;
    this.hanlder = this.invite = this.channel = false;
    this.addUser = false;
    this.addHanlder = false;
    this.createChannel = false;
  }

  addUserPage ()
  {
    this.selected_option = 'add-user-list';
    this.hanlder = this.invite = this.channel = this.user = false;
    this.addUser = true;
    this.addHanlder = false;
    this.createChannel = false;
  }

  addHanlderPage ()
  {
    this.selected_option = 'add-handlers-list';
    this.selected_option = 'add-handlers-list';
    this.hanlder = this.invite = this.channel = this.user = false;
    this.addUser = false;
    this.addHanlder = true;
    this.createChannel = false;
  }

  createChannelPage ()
  {
    this.selected_option = 'create-channel-form';
    this.hanlder = this.invite = this.channel = this.user = false;
    this.addUser = false;
    this.addHanlder = false;
    this.createChannel = true;
  }

  logout ()
  {
    this.chatservice.onLogout();
    this.router.navigateByUrl('login');
    this.authservice.logout();
    this.chatservice.clear();
  }

  sidebarToggle ()
  {
    const sidebar = document.querySelector('nav');
    if (sidebar)
    {
      sidebar.classList.toggle('close');
      if (sidebar.classList.contains('close'))
      {
        localStorage.setItem('status', 'close');
      } else
      {
        localStorage.setItem('status', 'open');
      }
    }
  }

  takeMeToHomePage ()
  {
    this.chatservice.adminpage = false;
    this.chatservice.homepage = true;
    this.chatservice.handlerpage = false;
    this.router.navigateByUrl('home');
  }
}
