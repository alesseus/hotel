import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Recensione } from "../interfacce/recensione";

@Injectable(
  {
    providedIn: 'root'
  })

export class RecensioneServices {

  //creare una proprietà per l'url
  private url: string = "https://hotel-4n9x.onrender.com/recensione/lista"

  //creo l'oggetto per effettuare la chiamata
  //utilizzando l'injection importata
  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      "Content-type": "application/json",
    })
  }
  getUtenti(): Observable<Array<Recensione>> {
    return this.http.get<Array<Recensione>>(this.url);
  }

  postUtente(nuovaRecensione: Recensione): any {
    return this.http.post(this.url, nuovaRecensione, this.httpOptions);
  }



}
