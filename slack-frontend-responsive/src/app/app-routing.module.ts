import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InviteGuard} from './authentication/invite.guard';
import {ResetPasswordComponent} from './authentication/reset-password/reset-password.component';
import {HomepageComponent} from './chat-page/homepage/homepage.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: "signup"
  },
  {
    path: 'workspace/public/:id',
    canActivate: [InviteGuard],
    component: HomepageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
