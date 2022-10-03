import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthenticationRoutingModule} from './authentication-routing.module';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {ForgetpasswordComponent} from './forgetpassword/forgetpassword.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {WorkspaceComponent} from './workspace/workspace.component';
@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    ForgetpasswordComponent,
    ResetPasswordComponent,
    WorkspaceComponent,
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatToolbarModule
  ]
})
export class AuthenticationModule { }
