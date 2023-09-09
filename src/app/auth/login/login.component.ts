import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService,
    public router: Router,
  ) {

  }
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.email, Validators.minLength(6)],)],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      name: ['', Validators.required],
      lastname: ['', Validators.required]
    });
  }

  login() {
    console.log(`tag:login ${this.username} ${this.password}`)
    this.userService.logWithPasswordAndEmail(this.username, this.password)
      .then(_ => this.router.navigate(["/", "dashboard"]))

  }

  register() {
    console.log(`register ${this.username} ${this.password}`)
    this.userService.registerWithPasswordAndEmail(this.username, this.password)
      .then(_ => this.router.navigate(["/", "dashboard"]))
  }

  toggleForm() {
    this.showRegistrationForm = !this.showRegistrationForm;
    this.isLoginForm = !this.isLoginForm;
  }
}
