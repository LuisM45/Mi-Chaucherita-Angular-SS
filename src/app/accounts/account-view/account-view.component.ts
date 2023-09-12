import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/shared/account.service';
@Component({
  selector: 'app-account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss']
})
export class AccountViewComponent implements OnInit {

  accountId: string = "";
  accountDetails: any;
  _Promise = Promise
  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accountId = params['accountId'];
      // Llama a tu servicio para obtener los detalles de la cuenta por accountId
      this.accountDetails = this.accountService.getAccountDetails(this.accountId);
    });
  }

  delete() {
    this.accountService.deleteAccount(this.accountId)
      .then(_=>this.router.navigate(["/"]))
  }
}
