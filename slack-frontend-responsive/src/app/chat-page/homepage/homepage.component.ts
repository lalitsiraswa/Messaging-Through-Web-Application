import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {ChatserviceService} from '../chatservice.service';
import {AuthenticationServiceService} from '../../authentication/authentication-service.service';
import {Router} from '@angular/router';

import {BehaviorSubject, from, map, Observable, of, tap} from 'rxjs';
import {SearchUserList} from 'src/app/Models/SearchUserList';
import {DashboardService} from 'src/app/dashboard/dashboard.service';
import {ToastrService} from 'ngx-toastr';
import {Notifications} from 'src/app/Models/Notifications';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit
{
  left_component_button: any;
  chat_option: String = 'group-chat';
  inFocus = false;
  @ViewChild(MatAccordion)
  accordion!: MatAccordion;
  initials = '';
  timeout: any = null;
  searchedUsers: Array<{username: String;}> | null = [];
  isLoading: Boolean = true;
  roleOfUser: any = '';
  userName: any = '';
  avatarName: any = '';
  groupChat = true;
  privateCHat = false;
  noDataToLoad: Boolean = false;
  windowsWidth: number = 0;
  left_Component: HTMLDivElement | null = null;
  right_component: HTMLDivElement | null = null;
  dummyPage: Boolean = true;
  dashboard: Boolean = true;
  message: any = '';
  notifications = Array<Notifications>();
  noticount = 0;

  constructor (
    private chatService: ChatserviceService,
    private authservice: AuthenticationServiceService,
    private router: Router,
    private dashboardservice: DashboardService,
    private toastr: ToastrService
  ) { }

  ngOnInit (): void
  {
    this.left_component_button = document.querySelector('.left-component-button');
    this.left_Component = document.querySelector('.left-component');
    this.right_component = document.querySelector('.right-container');
    this.roleOfUser = this.authservice.getRoleOfUser();
    this.userName = this.authservice.getNameFromStorage();
    if (!this.chatService.socket)
    {
      this.chatService.connect();
    }
    this.chatService.isLoading$.subscribe((loading: Boolean) =>
    {
      this.isLoading = loading;
    });
    this.chatService.noData$.subscribe((hasNoData: Boolean) =>
    {
      this.noDataToLoad = hasNoData;
    });
    if (this.roleOfUser === 'user')
    {
      // this.chatService.multipleDevices$.subscribe((hasMultipleDevices: Boolean) => {
      //   if (!hasMultipleDevices) {
      this.chatService.getUserData().subscribe();
      //   }
      // });
      this.isLoading = false;
    } else
    {
      this.isLoading = false;
    }
    this.chatService.notification$.subscribe((notifications: Array<Notifications>) =>
    {
      this.notifications = notifications;
      this.noticount = 0;
      notifications.forEach((notification: Notifications) => this.noticount += notification.count as number);

    });
    const fullName = this.userName.split(' ');
    for (let word of fullName)
    {
      this.initials += word[0].toUpperCase();
      this.avatarName += word[0].toUpperCase();
    }

    this.chatService.showAndHide$.subscribe((value) =>
    {
      if (this.right_component)
        this.right_component.style.display = 'block';
      this.windowsWidth = window.innerWidth;
      if (this.windowsWidth <= 1000)
      {
        if (this.left_Component && this.right_component)
        {
          this.switch_pages(this.left_Component, this.right_component);
        }
        if (this.right_component?.style.display == 'block' && this.left_component_button)
        {
          this.left_component_button.style.display = 'block';
        }
      }
    });

    this.chatService.fileMessage$.subscribe((res: String) =>
    {
      this.message = res;
      this.showSuccess();
      setTimeout(() =>
      {
        this.message = '';
      }, 1000);
    });

    this.dashboardservice.message$.subscribe((res: String) =>
    {
      this.message = res;
      this.showSuccess();
      setTimeout(() =>
      {
        this.message = '';
      }, 1000);
    });

    this.chatService.notify.subscribe((res: any) =>
    {
      this.message = res;
      this.showSuccess();
      setTimeout(() =>
      {
        this.message = '';
      }, 100000);
    });

    this.dashboard = !(this.authservice.getRoleOfUser() === 'user');
  }

  showSuccess ()
  {
    if (this.message)
    {
      this.toastr.success(this.message);
    }
  }

  showMessage (event: any)
  {
    this.message = 'No more messages!!!';
    this.showSuccess();
    setTimeout(() =>
    {
      this.message = '';
    }, 1000);
  }

  @HostListener('window:resize', ['$event'])
  onResize ()
  {
    if (window.innerWidth > 1000)
    {
      if (this.left_Component?.style.display == 'none')
      {
        this.left_Component.style.display = 'block';
      }
      if (this.right_component?.style.display == 'none')
        this.right_component.style.display = 'block';
      if (this.left_component_button.style.display = 'block')
        this.left_component_button.style.display = 'none';
    }
    if (window.innerWidth <= 1000)
    {
      // console.log(window.innerWidth);
      if (this.left_Component?.style.display == 'block' && this.right_component)
        this.right_component.style.display = 'none';
      if (this.right_component?.style.display == 'block' && this.left_component_button)
      {
        this.left_component_button.style.display = 'block';
      }

      // if (this.right_component)
      //   this.right_component.style.display = 'block';
      // if (this.left_Component?.style.display == 'block')
      //   this.left_Component.style.display = 'none';
      // if (this.right_component)
      //   this.right_component.style.display = 'block';
    }
  }
  // --------------------------------------------------------------------------------------------

  toggleSidebar ()
  {
    const sidebar = document.getElementById('sidebar');
    if (sidebar)
    {
      sidebar.classList.toggle('hide');
    }
  }

  searchUser (username: String)
  {
    this.chatService.getListOfSearchedUser(username, '1');
    this.chatService.searchedUsers$.subscribe(
      (res: Array<{username: String;}> | null) =>
      {
        this.searchedUsers = res;
      }
    );
  }

  selectFromNoti (chatName: String, isPrivate: boolean)
  {
    this.chatService.getInfo(chatName, isPrivate).subscribe();
    isPrivate ? this.openPrivateChat() : this.openGroupChat();
  }

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
      this.empty();
    }
  }

  selectUser (username: String)
  {
    this.inFocus = false;
    this.chatService.getInfo(username, true).subscribe();
  }

  takeMeToHandlerDashBoard ()
  {
    this.router.navigateByUrl('dashboard');
    this.chatService.adminpage = false;
    this.chatService.homepage = false;
    this.chatService.handlerpage = true;
  }

  takeMeToAdminDashBoard ()
  {
    this.router.navigateByUrl('admindashboard');
    this.chatService.adminpage = true;
    this.chatService.homepage = false;
    this.chatService.handlerpage = false;
  }

  logout ()
  {
    this.chatService.onLogout();
    this.authservice.logout();
    this.router.navigateByUrl('login');
    this.chatService.clear();
  }
  onBlur ()
  {
    setTimeout(() =>
    {
      this.inFocus = false;
    }, 500);
  }
  isFocused ()
  {
    this.inFocus = true;
  }

  empty ()
  {
    this.searchedUsers = [];
  }

  openGroupChat ()
  {
    this.chat_option = 'group-chat';
    this.groupChat = true;
    this.privateCHat = false;
  }

  openPrivateChat ()
  {
    this.chat_option = 'private-chat';
    this.privateCHat = true;
    this.groupChat = false;
  }
  flag = false;
  switch_pages (left_component_page: any, right_component_page: any)
  {
    this.flag = !this.flag;
    if (this.flag)
    {
      left_component_page.style.display = 'block';
      right_component_page.style.display = 'none';
      if (this.left_component_button)
        this.left_component_button.style.display = 'none';
    } else
    {
      left_component_page.style.display = 'none';
      right_component_page.style.display = 'block';
      if (this.left_component_button)
        this.left_component_button.style.display = 'block';
    }
  }
}
