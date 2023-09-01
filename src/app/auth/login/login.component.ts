import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username: string = "";
  password: string = "";

  constructor(
    public userService: UserService,
    public router: Router
    ){

  }

  login(){
    console.log(`login ${this.username} ${this.password}`)
    this.userService.logWithPasswordAndEmail(this.username,this.password)
    .then(_=>this.router.navigate(["/","dashboard"]))
    
  }

  register(){
    console.log(`register ${this.username} ${this.password}`)
    this.userService.registerWithPasswordAndEmail(this.username,this.password)
      .then(_=>this.router.navigate(["/","dashboard"]))
  }
}
