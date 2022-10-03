import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {forkJoin} from 'rxjs';
import {AuthenticationServiceService} from 'src/app/authentication/authentication-service.service';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit
{
  fileEvent: any;
  channelName = this.chatService.isPrivateChat
    ? this.chatService.chatId
    : this.chatService.channelName;
  token: any = '';
  constructor (
    private chatService: ChatserviceService,
    private authservice: AuthenticationServiceService,
    public dialogRef: MatDialogRef<DialogComponent>
  ) { }

  ngOnInit (): void
  {
    this.token = this.authservice.getTokenFromStoarge();
    this.chatService.progressBar$.subscribe((res: any) =>
    {
      this.val = res;
    });

    this.chatService.closeProgressBar$.subscribe((res: any) =>
    {
      if (res === true)
      {
        // this.close();
      }
    });
  }
  @ViewChild('file', {static: false}) file: any;

  public files: Set<File> = new Set();

  progress: any;
  canBeClosed = true;
  primaryButtonText = 'Upload';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;
  val: any = 0;
  uploadButton: any = false;

  onFilesAdded (event: any)
  {
    this.fileEvent = event;
    this.uploadButton = true;
  }

  addFiles ()
  {
    this.file.nativeElement.click();
  }
  closeDialog ()
  {
    // if everything was uploaded already, just close the dialog

    if (this.uploadSuccessful)
    {
      return this.dialogRef.close();
    }

    // set the component state to "uploading"
    this.uploading = true;

    // start the upload and save the progress map
    this.progress = this.chatService.postFile(this.fileEvent);
    console.log(this.progress);
    for (const key in this.progress)
    {
      this.progress[key].progress.subscribe((val: any) => console.log(val));
    }

    // convert the progress map into an array
    let allProgressObservables = [];
    for (let key in this.progress)
    {
      allProgressObservables.push(this.progress[key].progress);
    }

    // Adjust the state variables

    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';

    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;

    // Hide the cancel-button
    this.showCancelButton = false;

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end =>
    {
      // ... the dialog can be closed again...
      this.canBeClosed = true;
      this.dialogRef.disableClose = false;

      // ... the upload was successful...
      this.uploadSuccessful = true;

      // ... and the component is no longer uploading
      this.uploading = false;
    });
  }
}
