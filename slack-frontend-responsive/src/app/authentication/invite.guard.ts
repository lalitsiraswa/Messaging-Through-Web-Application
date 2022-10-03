import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {ChatserviceService} from '../chat-page/chatservice.service';
import {AuthenticationServiceService} from './authentication-service.service';
import {AuthguardGuard} from './authguard.guard';

@Injectable({
  providedIn: 'root'
})
export class InviteGuard implements CanActivate
{

  isuserloggedin = false;
  id: any = null;

  constructor (private authservice: AuthenticationServiceService, private router: Router, private acrtivatedroute: ActivatedRoute, private chatservice: ChatserviceService)
  {

  }
  canActivate (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {

    if (this.authservice.isUserLoggedIn())
    {
      this.id = this.acrtivatedroute.snapshot.paramMap.get("id");
      sessionStorage.setItem('inviteid', this.id);
      this.chatservice.invitelink(this.id);
    }
    else
    {
      this.id = this.acrtivatedroute.snapshot.paramMap.get("id");
      sessionStorage.setItem('inviteid', this.id);
      this.router.navigateByUrl("login");
    }
    return true;

  }

}
