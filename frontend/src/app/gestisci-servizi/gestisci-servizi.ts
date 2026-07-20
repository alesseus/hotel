import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { servizio } from './interfacce/servizi_i';

@Component({
  selector: 'app-gestisci-  servizi',
  imports: [RouterLink, FormsModule],
  templateUrl: './gestisci-servizi.html',
  styleUrl: './gestisci-servizi.css',
})
export class GestisciServizi {}
