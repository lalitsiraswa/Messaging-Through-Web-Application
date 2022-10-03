import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, tap, throwError} from 'rxjs';
import {forgetPasswordBody} from '../Models/ForgetPasswordBody';
import {forgetPasswordResponse} from '../Models/ForgetPasswordResponse';
import {forgetPasswordSuccessResponse} from '../Models/ForgetPasswordSuccessResponse';
import {AuthResponse} from '../Models/AuthResponse';
import {User} from '../Models/User';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService
{

  URL = "http://localhost:3000";

  constructor (private http: HttpClient, private router: Router) { }

  storeInSessionStoarge (res: AuthResponse)
  {
    sessionStorage.setItem('username', JSON.stringify(res.payload.username));
    sessionStorage.setItem('token', JSON.stringify(res.token));
    sessionStorage.setItem('payload', JSON.stringify(res.payload));
  }

  getRoleOfUser ()
  {
    let payload = sessionStorage.getItem('payload');
    return payload ? JSON.parse(payload).role : null;
  }

  getPayload ()
  {
    let payload = sessionStorage.getItem("payload");
    return payload ? JSON.parse(payload) : null;
  }

  deleteFromSessionStorage ()
  {
    sessionStorage.clear();
  }

  isUserLoggedIn (): boolean
  {
    return sessionStorage.getItem('token') ? true : false;
  }

  getTokenFromStoarge (): String
  {
    const token = sessionStorage.getItem('token');
    return token ? JSON.parse(token) : "";
  }

  getNameFromStorage (): String
  {
    const payload = sessionStorage.getItem('payload');
    return payload ? JSON.parse(payload).name : "";
  }

  getUserNameFromStorage (): String
  {
    let username = sessionStorage.getItem('username');
    return username ? JSON.parse(username) : "";
  }

  getWorkspace (): String
  {
    let payload = sessionStorage.getItem('payload');
    return payload ? JSON.parse(payload).workspace : "";
  }

  signUp (user: User)
  {
    return this.http.post<AuthResponse>(`${this.URL}/signup`, user).pipe(
      tap((res: AuthResponse) =>
      {
        this.storeInSessionStoarge(res);
      }),
      catchError(error =>
      {
        return throwError(error.error.message);
      })
    );
  }

  //   errorHandler(error: HttpErrorResponse) {
  //     return Observable.throw(error.message || "server error.");
  // }

  login (loginDetails: any)
  {
    return this.http.post<AuthResponse>(`${this.URL}/login`, loginDetails).pipe(
      tap((res: AuthResponse) =>
      {
        this.storeInSessionStoarge(res);
      }),
      catchError(error =>
      {
        return throwError(error.error.message);
      })
    );
  }

  logout ()
  {
    this.deleteFromSessionStorage();
  }


  forgetPassword (username: any)
  {

    return this.http.get<forgetPasswordResponse>(`${this.URL}/user/${username}`);

  }


  sendResetPasswordLink (username: String)
  {

    return this.http.post<forgetPasswordSuccessResponse>(`${this.URL}/forgot-password`, {username: username});

  }

  resetPassword (token: String, password: String)
  {
    return this.http.post<any>(`${this.URL}/forgot-password/` + token, {password: password});
  }


  createWorkspace (workspaceName: String)
  {
    const token = this.getTokenFromStoarge();
    const headers = new HttpHeaders({"Authorization": token ? `Bearer ${token}` : ""});


    this.http.post<AuthResponse>(`${this.URL}/workspace/add`, {username: this.getUserNameFromStorage(), workspaceName}, {headers}).pipe(
      tap((res: AuthResponse) =>
      {
        sessionStorage.clear();
        this.storeInSessionStoarge(res);
        this.router.navigateByUrl("dashboard");
      })
    ).subscribe();
  }

}
