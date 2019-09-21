import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    let authorization = localStorage.getItem('currentUser');
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
