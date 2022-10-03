import {Component, OnInit} from '@angular/core';
import {AuthenticationServiceService} from 'src/app/authentication/authentication-service.service';
import {Files} from 'src/app/Models/File';
import {ChatserviceService} from '../../chatservice.service';

@Component({
  selector: 'app-filepage',
  templateUrl: './filepage.component.html',
  styleUrls: ['./filepage.component.css'],
})
export class FilepageComponent implements OnInit
{
  files: Array<Files> = Array<Files>();
  receivedFile: Array<Files> = Array<Files>();
  sentFile: Array<Files> = Array<Files>();
  currentUser = this.chatService.userName$.getValue();
  constructor (
    private chatService: ChatserviceService,
    private authservice: AuthenticationServiceService
  ) { }

  ngOnInit (): void
  {
    this.chatService.files$.subscribe((files: Array<Files>) =>
    {
      this.files = files;
      this.receivedFile = [];
      this.sentFile = [];
      for (let file of files)
      {
        if (file.fileOwner === this.authservice.getUserNameFromStorage())
        {
          this.sentFile.push(file);
        } else
        {
          this.receivedFile.push(file);
        }
      }
      this.files = files;
    });
  }

  selectFile (file: any, action: String)
  {
    if (action === 'delete')
    {
      this.chatService.deleteFile(file);
    } else
    {
      this.chatService.downloadFile(file);
    }
  }
  toDate (epoch: any): any
  {
    const convertToEpoch = new Date(epoch).getTime();
    const convertedDate = convertToEpoch as number;
    const date = new Date(convertedDate);
    date.toString().split(' ');
    const min =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return date.getHours() + ':' + min;
  }
}
