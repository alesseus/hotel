import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { PrenotazioneServices } from './Services/services';
import { prenotazione } from './interfacce/prenotazione_i';
import { stanza } from '../gestisci-stanza/interfacce/stanza_i';
import { servizio } from '../servizi/interfacce/servizio_i';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prenotazione',
  imports: [FormsModule],
  templateUrl: './prenotazione.html',
  styleUrl: './prenotazione.css',
  providers: [PrenotazioneServices]
})
export class Prenotazione implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly API = 'https://hotel-4n9x.onrender.com';
  private readonly router = inject(Router)

  constructor(private _PrenotazioneServices: PrenotazioneServices) { }

  // ── Wizard ────────────────────────────────────────────────────
  step = 0;
  tipoPrenotazione: 'spa' | 'stanza' | '' = '';
  formError = '';
  confermata = false;
  invio = false;

  // ── Dati remoti ───────────────────────────────────────────────
  stanzeDisponibili = signal<stanza[]>([]);
  serviziDisponibili = signal<servizio[]>([]);
  listaPrenotazioni = signal<prenotazione[]>([]);

  // ── Selezioni ────────────────────────────────────────────────
  stanzaSelezionata: stanza | null = null;
  serviziSelezionati: servizio[] = [];

  // ── Form dati ─────────────────────────────────────────────────
  nome = '';
  cognome = '';
  email = '';
  telefono = '';
  dataNascita = '';
  checkIn = '';
  checkOut = '';
  note = '';

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.caricaStanze();
    this.caricaServizi();
  }

  caricaStanze(): void {
    this.http.get<stanza[]>(`${this.API}/stanza/elenco`).subscribe({
      next: (data) => this.stanzeDisponibili.set(data),
      error: (err) => console.error('Errore caricamento stanze', err)
    });
  }

  caricaServizi(): void {
    this.http.get<servizio[]>(`${this.API}/servizio/elenco`).subscribe({
      next: (data) => this.serviziDisponibili.set(data),
      error: (err) => console.error('Errore caricamento servizi', err)
    });
  }

  // ── Wizard methods ────────────────────────────────────────────
  scegliTipo(tipo: 'spa' | 'stanza'): void {
    this.tipoPrenotazione = tipo;
    this.step = tipo === 'spa' ? 3 : 1;  // SPA → step 3 diretto
  }

  selezionaStanza(s: stanza): void {
    this.stanzaSelezionata = s;
    this.step = 2;
  }

  toggleServizio(s: servizio): void {
    const idx = this.serviziSelezionati.findIndex(x => x.IDSERVIZIO === s.IDSERVIZIO);
    if (idx >= 0) {
      this.serviziSelezionati.splice(idx, 1);
    } else {
      this.serviziSelezionati.push(s);
    }
  }

  isServizioSelezionato(s: servizio): boolean {
    return this.serviziSelezionati.some(x => x.IDSERVIZIO === s.IDSERVIZIO);
  }

  // ── Calcolo totale ────────────────────────────────────────────
  get totale(): number {
    const costoStanza = this.stanzaSelezionata ? this.stanzaSelezionata.COSTO : 0;
    const costoServizi = this.serviziSelezionati.reduce((sum, s) => sum + s.COSTO, 0);
    return costoStanza + costoServizi;
  }

  // ── Submit ────────────────────────────────────────────────────
  confermaPrenotazione(form: NgForm): void {
    this.formError = '';

    if (form.invalid) {
      this.formError = 'Compila tutti i campi obbligatori prima di confermare.';
      return;
    }

    const nuova: prenotazione = {
      IDPRE: 0,
      NOME: this.nome,
      COGNOME: this.cognome,
      EMAIL: this.email,
      TELEFONO: this.telefono,
      DATANASCITA: new Date(this.dataNascita),
      IDSTANZA: this.stanzaSelezionata?.IDSTANZA ?? 0,
      IDSERVIZIO: this.serviziSelezionati[0]?.IDSERVIZIO ?? 0,
      TOTALE: this.totale,
      SPA: this.tipoPrenotazione === 'spa',
      NOTE: this.note,
      CHECK_IN: new Date(this.checkIn),
      CHECK_OUT: new Date(this.checkOut),
      STATO: 'In attesa'
    };

    this.invio = true;

    this._PrenotazioneServices.postUtente(nuova).subscribe({
      next: () => {
        this.invio = false;
        this.confermata = true;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err: any) => {
        this.invio = false;
        console.error('Errore conferma prenotazione', err);
        this.formError = 'Errore durante l\'invio della prenotazione. Riprova.';
      }
    });
  }
}