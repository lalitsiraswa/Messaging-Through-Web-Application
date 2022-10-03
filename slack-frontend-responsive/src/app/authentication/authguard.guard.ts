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
import {map} from 'rxjs/operators';
import {ChatserviceService} from '../chat-page/chatservice.service';
import {AuthenticationServiceService} from './authentication-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthguardGuard implements CanActivate
{
  homepage = true;
  admindashboard = false;
  handerdashboard = false;

  constructor (
    private authService: AuthenticationServiceService,
    private router: Router,
    private chatservice: ChatserviceService
  )
  {
    if (this.authService.isUserLoggedIn())
    {
      if (this.authService.getRoleOfUser() === 'admin')
      {
        this.chatservice.adminpage = false;
        this.chatservice.homepage = false;
        this.chatservice.handlerpage = true;
      } else if (this.authService.getRoleOfUser() === 'handler')
      {
        this.chatservice.adminpage = false;
        this.chatservice.homepage = false;
        this.chatservice.handlerpage = true;
      } else
      {
        this.chatservice.adminpage = false;
        this.chatservice.homepage = true;
        this.chatservice.handlerpage = false;
      }
    }
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
    if (this.authService.isUserLoggedIn())
    {
      if (this.chatservice.adminpage)
      {
        console.log('dashboard');
        this.router.navigateByUrl('dashboard');
        return false;
      } else if (this.chatservice.handlerpage)
      {
        this.router.navigateByUrl('dashboard');
        return false;
      } else if (!this.authService.getPayload().workspace)
      {
        this.router.navigateByUrl('workspace');
        return false;
      }

      return true;
    } else
    {
      this.router.navigateByUrl('signup');
      return false;
    }
  }
}
