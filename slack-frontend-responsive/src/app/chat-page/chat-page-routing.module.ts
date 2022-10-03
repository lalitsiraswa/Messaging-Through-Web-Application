import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardGuard } from '../authentication/authguard.guard';
import { InviteGuard } from '../authentication/invite.guard';
import { HomepageComponent } from './homepage/homepage.component';

const routes: Routes = [
  {
    path:"home",
    canActivate:[AuthguardGuard],
    component:HomepageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatPageRoutingModule { }
