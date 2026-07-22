import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { cliente } from "../interfacce/cliente_i";

@Injectable({
  providedIn: 'root'
})
export class ClienteServices {

  private readonly API = "https://hotel-4n9x.onrender.com/cliente";
  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      "Content-type": "application/json",
    })
  }

  getClienti(): Observable<cliente[]> {
    return this.http.get<cliente[]>(`${this.API}/lista`);
  }

  addCliente(nuovoCliente: Partial<cliente>): Observable<cliente> {
    return this.http.post<cliente>(`${this.API}/aggiungi`, nuovoCliente, this.httpOptions);
  }

  aggiornaCliente(clienteAggiornato: cliente): Observable<cliente> {
    return this.http.put<cliente>(`${this.API}/aggiorna`, clienteAggiornato, this.httpOptions);
  }

  eliminaCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/cancella/${id}`);
  }
}
