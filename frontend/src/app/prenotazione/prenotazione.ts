import { Component, signal } from '@angular/core';
import { PrenotazioneServices } from './Services/services';
import { prenotazione } from './interfacce/prenotazione_i';
@Component({
  selector: 'app-prenotazione',
  imports: [],
  templateUrl: './prenotazione.html',
  styleUrl: './prenotazione.css',
   providers:[PrenotazioneServices]
})
export class Prenotazione {
   constructor(private _PrenotazioneServices:PrenotazioneServices){}

  listaRecensioni = signal(<Array<prenotazione>>[]);
}
