import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/shared/account.service';
@Component({
  selector: 'app-account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss']
})
export class AccountViewComponent implements OnInit {
  accountId: number = 0;
  accountDetails: any;

  constructor(private route: ActivatedRoute,
    private accountService: AccountService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accountId = params['accountId'];
      console.log(this.accountId);
      // Llama a tu servicio para obtener los detalles de la cuenta por accountId
      this.accountDetails = this.accountService.getAccountDetails(this.accountId);
      console.log(this.accountDetails);
    });
  }

}
