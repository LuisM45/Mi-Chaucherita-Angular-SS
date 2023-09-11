import { Component } from '@angular/core';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  selectedTimezone?: string; // Zona horaria seleccionada
  selectedCountry?: string; // País seleccionado
  timezones?: string[]; // Lista de zonas horarias
  countries?: string[]; // Lista de países de Sudamérica

  constructor() {
    // Definir la lista de zonas horaias 
    this.timezones = ['GMT+5', 'GMT+6', 'GMT+7', 'GMT+8', 'GMT+9', 'GMT+10', 'GMT+11', 'GMT+12', 'GMT+13', 'GMT+14'];

    // Definir la lista de países de Sudamérica (puedes personalizarla)
    this.countries = ['Ecuador', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Paraguay', 'Perú', 'Uruguay', 'Venezuela'];
  }
}

