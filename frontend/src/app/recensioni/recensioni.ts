import { Component, signal } from '@angular/core';
import { RecensioneServices } from './Services/services';
import { Recensione } from './interfacce/recensione';

@Component({
  selector: 'app-recensioni',
  imports: [],
  templateUrl: './recensioni.html',
  styleUrl: './recensioni.css',
  providers:[RecensioneServices]
})
export class Recensioni {
  constructor(private _RecensioniService:RecensioneServices){}

  listaRecensioni = signal(<Array<Recensione>>[]);

}
