import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { stanza } from "../interfacce/stanza_i";

export interface prenotazioneMin {
  IDSTANZA: number;
  CHECK_IN: string;
  CHECK_OUT: string;
  STATO: string;
}

@Injectable({
  providedIn: 'root'
})
export class StanzaServices {

  private readonly API = "https://hotel-4n9x.onrender.com/stanza";
  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      "Content-type": "application/json",
    })
  }

  getStanze(): Observable<stanza[]> {
    return this.http.get<stanza[]>(`${this.API}/elenco`);
  }

  addStanza(nuovaStanza: Partial<stanza>): Observable<stanza[]> {
    return this.http.post<stanza[]>(`${this.API}/add`, nuovaStanza, this.httpOptions);
  }

  aggiornaStanza(stanzaAggiornata: stanza): Observable<stanza[]> {
    return this.http.put<stanza[]>(`${this.API}/aggiorna`, stanzaAggiornata, this.httpOptions);
  }

  eliminaStanza(id: number): Observable<stanza[]> {
    return this.http.delete<stanza[]>(`${this.API}/elimina/${id}`);
  }

  getPrenotazioni(): Observable<prenotazioneMin[]> {
    return this.http.get<prenotazioneMin[]>('https://hotel-4n9x.onrender.com/prenotazione/lista');
  }
}