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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/projects';

    if (this.authenticationService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  login() {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
      .subscribe(
        data => {
          this.alertService.success('Login succesful!');
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        },
        error => {
          console.log(error);
          this.alertService.error(error.message);
          this.loading = false;
        });
  }

}
