import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthResponse} from 'src/app/Models/AuthResponse';
import {User} from 'src/app/Models/User';
import {AuthenticationServiceService} from '../authentication-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy
{

  signUpFormControl = new FormGroup({
    name: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required]),
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
  })

  message: String | null = null;

  constructor (private router: Router, private autheticationService: AuthenticationServiceService) { }
  ngOnDestroy (): void
  {
    this.message = null;
  }

  ngOnInit (): void
  {

  }

  goToLoginPage ()
  {
    this.router.navigateByUrl("login");
  }

  get name ()
  {
    return this.signUpFormControl.get('name');
  }

  get username ()
  {
    return this.signUpFormControl.get('username');
  }

  get email ()
  {
    return this.signUpFormControl.get('email');
  }

  get password ()
  {
    return this.signUpFormControl.get('password');
  }

  get company ()
  {
    return this.signUpFormControl.get('company');
  }


  onSubmit ()
  {
    let user: User = {
      name: this.signUpFormControl.get("name")?.value,
      username: this.signUpFormControl.get("username")?.value,
      email: this.signUpFormControl.get("email")?.value,
      password: this.signUpFormControl.get("password")?.value,
    }
    this.autheticationService.signUp(user).subscribe((res: AuthResponse) =>
    {
      console.log(res);
      console.log("lll")
      this.router.navigateByUrl("workspace")

    },
      (error) =>
      {
        console.log(error)
        this.message = error;
      }
    )
  }

  removeErrorMessage ()
  {
    this.message = null;
  }

}
