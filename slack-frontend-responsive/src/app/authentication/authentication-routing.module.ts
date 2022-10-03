import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthguardGuard} from './authguard.guard';
import {ForgetpasswordComponent} from './forgetpassword/forgetpassword.component';
import {GuardGuard} from './guard.guard';
import {LoginComponent} from './login/login.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {SignupComponent} from './signup/signup.component';
import {WorkspaceComponent} from './workspace/workspace.component';

const routes: Routes = [

  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [GuardGuard],
  }
  ,
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuardGuard],
  },
  {
    path: 'forget-password',
    component: ForgetpasswordComponent,
    canActivate: [GuardGuard],
  },
  {
    path: 'forgot-password/:token',
    component: ResetPasswordComponent,
    canActivate: [GuardGuard],
  },
  {
    path: 'workspace',
    component: WorkspaceComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
