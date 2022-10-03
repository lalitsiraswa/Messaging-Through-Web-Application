import
{
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {ChatserviceService} from '../../chatservice.service';
import {Message} from 'src/app/Models/Message';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from './dialog/dialog.component';
import {ScrollDirectiveDirective} from './scroll-directive.directive';
import {Files} from 'src/app/Models/File';
// import { LoremIpsum } from "lorem-ipsum";

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chatpage',
  templateUrl: './chatpage.component.html',
  styleUrls: ['./chatpage.component.css'],
  viewProviders: [ScrollDirectiveDirective],
})
export class ChatpageComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  @ViewChild('chats') myScrollContainer: ElementRef | undefined;
  scrolledToBottom = false;

  @Output() noChatsToShow = new EventEmitter<string>();

  username: String | null = '';
  messageList: Message[] | null = [];
  channelName?: String | null = '';
  textMessage: String = '';
  selectedFile: File = new File([''], '');
  isPrivateChat: Boolean = false;
  isActive: Boolean = false;
  isUserRemoved: Boolean = false;
  description: String = '';
  skip = 1;
  disableScrollDown = false;
  getMoreChats: Boolean = true;
  onTop: any = false;
  messages: Array<any[]> = [];
  previousHeight: any = 0;
  chatPage = true;
  infoPage = false;
  filePage = false;
  addUserPage = false;
  allMessages: Array<any> = [];

  isLoading: Boolean = false;
  message: String = '';

  lodedMessagesany = 1;
  firstScroll: any = true;

  constructor (
    private chatService: ChatserviceService,
    public dialog: MatDialog,
    private scrollDirective: ScrollDirectiveDirective
  ) { }
  ngAfterViewInit (): void
  {
    this.scrollToBottom();
  }

  ngAfterViewChecked () { }
  ngOnInit (): void
  {
    this.isPrivateChat = this.chatService.isPrivateChat;
    if (!this.chatService.isPrivateChat)
    {
      this.chatService.description$.subscribe((description: String) =>
      {
        this.description = description;
      });
    }
    this.chatService.isUserRemoved$.subscribe((isRemoved: Boolean) =>
    {
      this.isUserRemoved = isRemoved;
    });
    this.chatService.userActive$.subscribe((active: Boolean) =>
    {
      this.isActive = active;
    });
    this.chatService.userName$.subscribe((username) =>
    {
      this.username = username;
    });
    this.chatService.messageList$.subscribe((messages) =>
    {
      this.messageList = messages;
    });
    this.chatService.allMessages$.subscribe((messages: Array<Message | Files>) =>
    {
      this.allMessages = messages;
    });
    this.chatService.channelName$.subscribe((channelName) =>
    {
      this.channelName = this.chatService.isPrivateChat
        ? channelName
        : channelName?.substring(0, channelName.indexOf('@'));
    });
    this.chatService.loadMoreMessages.subscribe((res: Boolean) =>
    {
      this.getMoreChats = res;
    });
  }

  onScrollUp ()
  {
    if (this.getMoreChats)
    {
      this.isLoading = true;
      this.chatService.getMessage(this.skip);
      this.skip += 1;
      this.chatService.isLoading$.subscribe((isLoading: Boolean) =>
      {
        this.isLoading = isLoading;
      });
    } else
    {
      this.noChatsToShow.emit('No more chats are available to show!!!');
    }
  }

  scrollToBottom (): void
  {
    try
    {
      /**Add the condition**/
      if (!this.scrolledToBottom && this.myScrollContainer)
      {
        if (this.firstScroll)
        {
          this.myScrollContainer.nativeElement.scrollTop =
            this.myScrollContainer.nativeElement.scrollHeight;
          this.previousHeight =
            this.myScrollContainer.nativeElement.scrollHeight;
          this.firstScroll = false;
        } else
        {
          this.myScrollContainer.nativeElement.scrollTop =
            this.myScrollContainer.nativeElement.scrollHeight -
            this.previousHeight;
          this.previousHeight =
            this.myScrollContainer.nativeElement.scrollHeight -
            this.myScrollContainer.nativeElement.scrollTop;
        }
      }
    } catch (err) { }
  }

  onScroll ()
  {
    this.scrolledToBottom = true;
    if (this.myScrollContainer?.nativeElement.scrollHeight === 0)
    {
    }
  }

  onSendMessage ()
  {
    if (this.textMessage)
    {
      this.chatService.sendMessage(this.textMessage);
      this.textMessage = '';
    }
  }
  selectFile (event: any)
  {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
    this.uploadSelectedFile();
    this.chatService.postFile(event);
  }

  uploadSelectedFile ()
  {
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    this.scrollToBottom();
  }

  goToInfoPage ()
  {
    this.chatPage = false;
    this.infoPage = true;
    this.addUserPage = false;
    this.filePage = false;
  }
  goToChatPage ()
  {
    this.chatPage = true;
    this.infoPage = false;
    this.filePage = false;
    this.addUserPage = false;
  }
  goToFilePage ()
  {
    this.filePage = true;
    this.infoPage = false;
    this.chatPage = false;
    this.addUserPage = false;
  }

  goToAddUserPage ()
  {
    this.filePage = false;
    this.infoPage = false;
    this.chatPage = false;
    this.addUserPage = true;
  }

  scrollHandler (e: any)
  {
    console.log(e);
    this.isLoading = true;
    if (e === "top")
    {
      this.onTop = true;
      this.chatService.getMessage(this.skip);
      this.skip += 1;
    }
    this.chatService.isLoading$.subscribe((isLoading: Boolean) =>
    {
      this.isLoading = isLoading;
    });
  }
  openDialog ()
  {
    this.dialog.open(DialogComponent);
  }
  toDate (epoch: Number): any
  {
    const convertedDate = epoch as number;
    const date = new Date(convertedDate);
    date.toString().split(' ');
    const min =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return date.getHours() + ':' + min;
  }

  onlyDate (epoch: Number)
  {
    const convertedDate = epoch as number;
    const date = new Date(convertedDate);
    let ans = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
    return ans;
  }

  downloadFile (file: Files)
  {
    this.chatService.downloadFile(file);
  }
}
