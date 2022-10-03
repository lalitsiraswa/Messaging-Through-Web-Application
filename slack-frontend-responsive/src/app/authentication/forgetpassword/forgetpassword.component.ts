import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {forgetPasswordResponse} from 'src/app/Models/ForgetPasswordResponse';
import {forgetPasswordSuccessResponse} from 'src/app/Models/ForgetPasswordSuccessResponse';
import {AuthenticationServiceService} from '../authentication-service.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent implements OnInit, OnDestroy
{

  usernameFormControl = new FormGroup(
    {
      username: new FormControl("", [Validators.required])
    }
  );

  message: String | null = null;

  constructor (private authservice: AuthenticationServiceService) { }
  ngOnDestroy (): void
  {
    this.message = null;
  }

  ngOnInit (): void
  {
  }

  onSubmit ()
  {
    let name = this.usernameFormControl.get("username")?.value;
    this.authservice.forgetPassword(name).subscribe((res: forgetPasswordResponse) =>
    {
      this.authservice.sendResetPasswordLink(name).subscribe((result: forgetPasswordSuccessResponse) =>
      {
        this.message = result.message;
      },
        (error) =>
        {
          this.message = error.error.message;
        }
      );
    },
      (error) =>
      {
        this.message = error.error.message;
      }
    );
  }

  get username ()
  {
    return this.usernameFormControl.get('username');
  }

  removeErrorMessage ()
  {
    this.message = null;
  }

}
