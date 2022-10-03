import {Injectable} from '@angular/core';
import
{
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationServiceService} from '../authentication/authentication-service.service';
import {ChatserviceService} from '../chat-page/chatservice.service';

@Injectable({
  providedIn: 'root',
})
export class DashboadGuardGuard implements CanActivate
{
  constructor (
    private authservice: AuthenticationServiceService,
    private router: Router,
    private chatService: ChatserviceService
  )
  {
    // this.chatService.multipleDevices$.subscribe((multipleLogin: Boolean) => {
    //   if (!multipleLogin) {
    // this.chatService.getWorkspaceInfo();
    //   }
    // });
  }
  canActivate (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree
  {
    if (
      this.authservice.getRoleOfUser() === 'handler' ||
      this.authservice.getRoleOfUser() === 'admin'
    )
    {
      return true;
    } else
    {
      this.router.navigateByUrl('home');
      return false;
    }
  }
}
