import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {AuthenticationServiceService} from '../authentication-service.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
})
export class WorkspaceComponent implements OnInit
{
  FormControl = new FormGroup({
    workspacename: new FormControl('', [Validators.required]),
  });

  message: String | null = null;

  constructor (
    private router: Router,
    private authenticationService: AuthenticationServiceService
  ) { }
  ngOnDestroy (): void
  {
    this.message = null;
  }

  ngOnInit (): void { }

  onSubmit ()
  {
    const workspaceName = this.FormControl.get('workspacename')?.value;
    this.authenticationService.createWorkspace(workspaceName);
  }

  get workspacename ()
  {
    return this.FormControl.get('workspacename');
  }

  goToSingupPage ()
  {
    this.router.navigateByUrl('signup');
  }

  removeErrorMessage ()
  {
    this.message = null;
  }

  logOut ()
  {
    this.authenticationService.logout();
    this.router.navigateByUrl('login');
  }
}
