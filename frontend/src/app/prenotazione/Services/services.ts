import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { prenotazione } from "../interfacce/prenotazione_i";

@Injectable(
  {
    providedIn: 'root'
  })

export class PrenotazioneServices {

  private readonly API = "https://hotel-4n9x.onrender.com/prenotazione";

  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      "Content-type": "application/json",
    })
  }
  getUtenti(): Observable<Array<prenotazione>> {
    return this.http.get<Array<prenotazione>>(`${this.API}/lista`);
  }

  postUtente(nuovaPrenotazione: prenotazione): Observable<any> {
    return this.http.post(`${this.API}/add`, nuovaPrenotazione, this.httpOptions);
  }
}