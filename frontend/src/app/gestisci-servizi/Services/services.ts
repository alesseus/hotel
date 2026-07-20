import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { servizio } from "../interfacce/servizi_i";

@Injectable({
  providedIn: 'root'
})
export class ServizioServices {

  private readonly API = "https://hotel-4n9x.onrender.com/servizio";
  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      "Content-type": "application/json",
    })
  }

  getServizi(): Observable<servizio[]> {
    return this.http.get<servizio[]>(`${this.API}/elenco`);
  }

  addServizio(nuovoServizio: Partial<servizio>): Observable<servizio[]> {
    return this.http.post<servizio[]>(`${this.API}/add`, nuovoServizio, this.httpOptions);
  }

  aggiornaServizio(servizioAggiornato: servizio): Observable<servizio[]> {
    return this.http.put<servizio[]>(`${this.API}/aggiorna`, servizioAggiornato, this.httpOptions);
  }

  eliminaServizio(id: number): Observable<servizio[]> {
    return this.http.delete<servizio[]>(`${this.API}/elimina/${id}`);
  }
}