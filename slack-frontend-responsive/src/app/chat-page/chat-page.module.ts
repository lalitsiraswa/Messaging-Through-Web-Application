import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ChatPageRoutingModule} from './chat-page-routing.module';
import {HomepageComponent} from './homepage/homepage.component';
import {ChatpageComponent} from './components/chatpage/chatpage.component';
import {MatListModule} from '@angular/material/list';
import {MatTreeModule} from '@angular/material/tree';
import {MatInputModule} from '@angular/material/input';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ChannelscomponentComponent} from './components/channelscomponent/channelscomponent.component';
import {DirectmessagescomponentComponent} from './components/directmessagescomponent/directmessagescomponent.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {FormsModule} from '@angular/forms';
import {ChatInfoComponent} from './components/chat-info/chat-info.component';
import {ModalComponent} from './components/modal/modal.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FilepageComponent} from './components/filepage/filepage.component';
import {IgxAvatarModule} from 'igniteui-angular';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ChatpageDirective} from './components/chatpage.directive';
import {DialogComponent} from './components/chatpage/dialog/dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ToastrModule} from 'ngx-toastr';
import {ScrolltobottomDirective} from './components/chatpage/scrolltobottom.directive';
import {ScrollDirectiveDirective} from './components/chatpage/scroll-directive.directive';
@NgModule({
  declarations: [
    HomepageComponent,
    ChatpageComponent,
    ChannelscomponentComponent,
    DirectmessagescomponentComponent,
    ChatInfoComponent,
    ModalComponent,
    FilepageComponent,
    ChatpageDirective,
    DialogComponent,
    ScrolltobottomDirective,
    ScrollDirectiveDirective,
  ],
  imports: [
    CommonModule,
    ChatPageRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatTreeModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTabsModule,
    MatGridListModule,
    ReactiveFormsModule,
    MatCardModule,
    MatExpansionModule,
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    IgxAvatarModule,
    MatTooltipModule,
    MatProgressBarModule,
    InfiniteScrollModule,
    ToastrModule.forRoot({
      timeOut: 1000,
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
  ],
})
export class ChatPageModule { }
