import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Prenotazione {
  NOME: string; COGNOME: string; EMAIL: string; TELEFONO: string;
  DATANASCITA: string; IDSTANZA: number | null; IDSERVIZIO: number | null;
  TOTALE: number | null; SPA: boolean; NOTE: string;
  CHECK_IN: string; CHECK_OUT: string; STATO: string;
}

@Component({
  selector: 'app-gestisci-prenotazione',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './gestisci-prenotazione.html',
  styleUrl: './gestisci-prenotazione.css',
})
export class GestisciPrenotazione {

  mostraMod = false;
  nuova: Prenotazione = this.prenotazioneVuota();

  constructor(private http: HttpClient) {}

  prenotazioneVuota(): Prenotazione {
    return {
      NOME: '', COGNOME: '', EMAIL: '', TELEFONO: '', DATANASCITA: '',
      IDSTANZA: null, IDSERVIZIO: null, TOTALE: null, SPA: false,
      NOTE: '', CHECK_IN: '', CHECK_OUT: '', STATO: ''
    };
  }

  apriModale() { this.mostraMod = true; }

  chiudiModale() { this.mostraMod = false; this.nuova = this.prenotazioneVuota(); }

  salvaPrenotazione() {
    this.http.post('/prenotazione/add', this.nuova).subscribe({
      next: () => { alert('Prenotazione aggiunta con successo!'); this.chiudiModale(); },
      error: (err) => { console.error(err); alert('Errore durante il salvataggio.'); }
    });
  }
}