import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { prenotazione } from "../../prenotazione/interfacce/prenotazione_i";
import { stanza } from "../../gestisci-stanza/interfacce/stanza_i";
import { servizio } from "../interfacce/servizio_i";

@Injectable({ providedIn: 'root' })
export class GestisciPrenotazioneServices {

  private readonly API_PRE      = 'https://hotel-4n9x.onrender.com/prenotazione';
  private readonly API_STANZA   = 'https://hotel-4n9x.onrender.com/stanza';
  private readonly API_SERVIZIO = 'https://hotel-4n9x.onrender.com/servizio';

  private readonly http = inject(HttpClient);

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  getPrenotazioni(): Observable<prenotazione[]> {
    return this.http.get<prenotazione[]>(`${this.API_PRE}/lista`);
  }

  addPrenotazione(nuova: Partial<prenotazione>): Observable<any> {
    return this.http.post<any>(`${this.API_PRE}/add`, nuova, this.httpOptions);
  }

  cambiaPrenotazione(aggiornata: prenotazione): Observable<any> {
    return this.http.put<any>(`${this.API_PRE}/cambia`, aggiornata, this.httpOptions);
  }

  cancellaPrenotazione(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_PRE}/cancella/${id}`);
  }

  getStanze(): Observable<stanza[]> {
    return this.http.get<stanza[]>(`${this.API_STANZA}/elenco`);
  }

  getServizi(): Observable<servizio[]> {
    return this.http.get<servizio[]>(`${this.API_SERVIZIO}/elenco`);
  }
}
