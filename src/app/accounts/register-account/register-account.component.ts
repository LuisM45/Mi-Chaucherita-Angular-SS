import { Component } from '@angular/core';

@Component({
  selector: 'app-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: ['./register-account.component.scss']
})
export class RegisterAccountComponent {
  typesAccount?: string[]; // Lista de tipos de cuenta
  selectedType?: string; // Tipo de cuenta seleccionado
  accountName?: string; // Nombre de la cuenta

  constructor() {
    // Definir la lista de tipos de cuenta
    this.typesAccount = ['Ingreso', 'Egreso', 'Ingreso/Egreso'];
  }
}
