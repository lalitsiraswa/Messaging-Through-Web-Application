import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ChatserviceService} from 'src/app/chat-page/chatservice.service';
import {AuthResponse} from 'src/app/Models/AuthResponse';
import {AuthenticationServiceService} from '../authentication-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy
{
  consumer: any;

  loginFormControl = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  message: String | null = null;

  constructor (
    private router: Router,
    private authenticationService: AuthenticationServiceService,
    private chatservice: ChatserviceService
  ) { }
  ngOnDestroy (): void
  {
    this.message = null;
  }

  ngOnInit (): void { }

  onSubmit ()
  {
    let loginDetails = {
      username: this.loginFormControl.get('username')?.value,
      password: this.loginFormControl.get('password')?.value,
    };
    this.authenticationService.login(loginDetails).subscribe(
      (res: AuthResponse) =>
      {
        this.authenticationService.storeInSessionStoarge(res);
        if (sessionStorage.getItem('inviteid') !== null)
        {
          this.chatservice.invitelink(sessionStorage.getItem('inviteid'));
        }
        if (res.payload.role == 'user')
        {
          this.router.navigateByUrl('home');
        } else if (
          res.payload.role === 'admin' ||
          res.payload.role === 'handler'
        )
        {
          this.router.navigateByUrl('dashboard');
        } else if (!res.payload.workspace)
        {
          this.router.navigateByUrl('workspace');
        }
      },
      (error) =>
      {
        this.message = error;
      }
    );
  }

  get username ()
  {
    return this.loginFormControl.get('username');
  }

  get password ()
  {
    return this.loginFormControl.get('password');
  }

  goToSingupPage ()
  {
    this.router.navigateByUrl('signup');
  }

  removeErrorMessage ()
  {
    this.message = null;
  }
}
