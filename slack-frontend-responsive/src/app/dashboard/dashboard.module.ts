import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DashboardRoutingModule} from './dashboard-routing.module';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {InvitesComponent} from './components/invites/invites.component';
import {ChannelsComponent} from './components/channels/channels.component';
import {UsersComponent} from './components/users/users.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {CreatechannelComponent} from './components/createchannel/createchannel.component';
import {CreatehandlerComponent} from './components/createhandler/createhandler.component';
import {AdduserComponent} from './components/adduser/adduser.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {HanldersComponent} from './components/hanlders/hanlders.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IgxAvatarModule} from 'igniteui-angular';
import {MatButtonModule} from '@angular/material/button';
import {ToastrModule} from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    DashboardComponent,
    InvitesComponent,
    ChannelsComponent,
    UsersComponent,
    CreatechannelComponent,
    CreatehandlerComponent,
    AdduserComponent,
    HanldersComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatListModule,
    ReactiveFormsModule,
    FormsModule,
    IgxAvatarModule,
    MatButtonModule,
    MatTooltipModule,
    ToastrModule.forRoot({
      timeOut: 1000,
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
  ],
})
export class DashboardModule { }
function timeOut (
  timeOut: any,
  arg1: number,
  positionClass: any,
  arg3: string,
  preventDuplicates: any,
  arg5: boolean
):
  | any[]
  | import('@angular/core').Type<any>
  | import('@angular/core').ModuleWithProviders<{}>
{
  throw new Error('Function not implemented.');
}

function positionClass (
  timeOut: (
    timeOut: any,
    arg1: number,
    positionClass: any,
    arg3: string,
    preventDuplicates: any,
    arg5: boolean
  ) =>
    | any[]
    | import('@angular/core').Type<any>
    | import('@angular/core').ModuleWithProviders<{}>,
  arg1: number,
  positionClass: any,
  arg3: string,
  preventDuplicates: any,
  arg5: boolean
):
  | any[]
  | import('@angular/core').Type<any>
  | import('@angular/core').ModuleWithProviders<{}>
{
  throw new Error('Function not implemented.');
}

function preventDuplicates (
  timeOut: (
    timeOut: any,
    arg1: number,
    positionClass: any,
    arg3: string,
    preventDuplicates: any,
    arg5: boolean
  ) =>
    | any[]
    | import('@angular/core').Type<any>
    | import('@angular/core').ModuleWithProviders<{}>,
  arg1: number,
  positionClass: (
    timeOut: (
      timeOut: any,
      arg1: number,
      positionClass: any,
      arg3: string,
      preventDuplicates: any,
      arg5: boolean
    ) =>
      | any[]
      | import('@angular/core').Type<any>
      | import('@angular/core').ModuleWithProviders<{}>,
    arg1: number,
    positionClass: any,
    arg3: string,
    preventDuplicates: any,
    arg5: boolean
  ) =>
    | any[]
    | import('@angular/core').Type<any>
    | import('@angular/core').ModuleWithProviders<{}>,
  arg3: string,
  preventDuplicates: any,
  arg5: boolean
):
  | any[]
  | import('@angular/core').Type<any>
  | import('@angular/core').ModuleWithProviders<{}>
{
  throw new Error('Function not implemented.');
}
