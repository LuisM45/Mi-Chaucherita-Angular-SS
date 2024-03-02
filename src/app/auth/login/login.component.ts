import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  username: string = "";
  password: string = "";
  repeatPassword: string = "";
  name: string = "";
  showRegistrationForm: boolean = false;
  isLoginForm: boolean = true;


  constructor(
    public userService: UserService,
    public router: Router,
  ) {

  }
  ngOnInit(): void {

  }

  login() {
    this.userService.logWithPasswordAndEmail(this.username, this.password)
      .then(_ => this.router.navigate(["/", "dashboard"]))

  }

  register() {
    this.userService.registerWithPasswordAndEmail(this.name,this.username, this.password)
      .then(_ => this.router.navigate(["/", "dashboard"]))
  }

  toggleForm() {
    this.showRegistrationForm = !this.showRegistrationForm;
    this.isLoginForm = !this.isLoginForm;
  }

}
