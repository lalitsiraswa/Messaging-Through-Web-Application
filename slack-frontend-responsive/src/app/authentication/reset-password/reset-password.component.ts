import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AuthenticationServiceService} from '../authentication-service.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy
{
  passwordControl = new FormGroup({
    password1: new FormControl('', Validators.required),
    password2: new FormControl('', Validators.required),
  });

  private token: String | null = null;

  message: String | null = null;

  constructor (
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationServiceService,
    private route: Router
  ) { }
  ngOnDestroy (): void
  {
    this.message = null;
  }

  ngOnInit (): void
  {
    this.activatedRoute.paramMap.subscribe((res: ParamMap) =>
    {
      let temp = res.get('token');
      if (temp)
      {
        this.token = temp;
      }
    });
  }

  onSubmit ()
  {
    if (
      this.token &&
      this.passwordControl.get('password1')?.value ===
      this.passwordControl.get('password2')?.value
    )
    {
      this.authService
        .resetPassword(this.token, this.passwordControl.get('password1')?.value)
        .subscribe(
          (res: any) =>
          {
            this.route.navigateByUrl('login');
          },
          (error) =>
          {
            this.message = error.error.message;
          }
        );
    }
  }

  get password1 ()
  {
    return this.passwordControl.get('password1');
  }

  get password2 ()
  {
    return this.passwordControl.get('password2');
  }

  removeErrorMessage ()
  {
    this.message = null;
  }
}
