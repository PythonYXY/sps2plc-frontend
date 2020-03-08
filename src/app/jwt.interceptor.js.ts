import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_USER } from './services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    let authorization = localStorage.getItem(CURRENT_USER);
    if (authorization == null) {
      authorization = '';
    }
    request = request.clone({
      setHeaders: {
        Authorization: authorization
      }
    });

    return next.handle(request);
  }
}
