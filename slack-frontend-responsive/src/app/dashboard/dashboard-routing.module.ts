import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ChannelsComponent} from './components/channels/channels.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {InvitesComponent} from './components/invites/invites.component';
import {UsersComponent} from './components/users/users.component';
import {DashboadGuardGuard} from './dashboad-guard.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [DashboadGuardGuard],
    component: DashboardComponent,
    children: [

      {
        path: 'invites',
        component: InvitesComponent
      },
      {
        path: 'channels',
        component: ChannelsComponent
      },
      {
        path: 'user-search',
        component: UsersComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
