import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { AlertService } from '../alert/alert.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) { }

  ngOnInit() {

    // get return url from route parameters or default to '/'
    this.returnUrl = '/projects';

    if (this.authenticationService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  login() {
    this.loading = true;
    this.router.navigate([this.returnUrl]);

  }

}
