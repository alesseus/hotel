import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Recensione } from "../interfacce/recensione";

@Injectable({
  providedIn: 'root'
})
export class RecensioneServices {

  private baseUrl: string = "https://hotel-4n9x.onrender.com/recensione";

  private readonly http = inject(HttpClient);
  private get jsonHeaders(): HttpHeaders {
    return new HttpHeaders({ "Content-Type": "application/json" });
  }
  private get authHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') ?? '';
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
  }

  
  getUtenti(): Observable<Array<Recensione>> {
    return this.http.get<Array<Recensione>>(`${this.baseUrl}/lista`);
  }

  
  postUtente(nuovaRecensione: Recensione): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/add`,
      nuovaRecensione,
      { headers: this.authHeaders }
    );
  }
}
