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
  get notti(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const inD = new Date(this.checkIn);
    const outD = new Date(this.checkOut);
    const diff = outD.getTime() - inD.getTime();
    const n = Math.round(diff / (1000 * 60 * 60 * 24));
    return n > 0 ? n : 0;
  }

  get costoStanza(): number {
    if (!this.stanzaSelezionata || this.tipoPrenotazione !== 'stanza') return 0;
    return this.stanzaSelezionata.COSTO * this.notti;
  }

  get costoServizi(): number {
    return this.serviziSelezionati.reduce((sum, s) => sum + s.COSTO, 0);
  }

  // ── Servizio SPA 
  get spaServizio(): servizio | undefined {
    return this.serviziDisponibili().find(s =>
      s.NOTE?.toUpperCase().replace(/\./g, '') === 'SPA'
    );
  }

  get costoSpa(): number {
    return this.spaServizio?.COSTO ?? 0;
  }

  get totale(): number {
    if (this.tipoPrenotazione === 'spa') {
      return this.costoSpa;
    }
    return this.costoStanza + this.costoServizi;
  }

  get caparra(): number {
    return +(this.totale * 0.10).toFixed(2);
  }

  // ── Submit ────────────────────────────────────────────────────
  confermaPrenotazione(form: NgForm): void {
    this.formError = '';

    if (form.invalid) {
      this.formError = 'Compila tutti i campi obbligatori prima di confermare.';
      return;
    }

    if (this.tipoPrenotazione === 'stanza' && this.notti <= 0) {
      this.formError = 'La data di check-out deve essere successiva al check-in.';
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
      IDSERVIZIO: this.tipoPrenotazione === 'spa'
        ? (this.spaServizio?.IDSERVIZIO ?? 0)
        : (this.serviziSelezionati[0]?.IDSERVIZIO ?? 0),
      TOTALE: this.totale,
      CAPARRA: this.caparra,
      SPA: this.tipoPrenotazione === 'spa',
      NOTE: this.note,
      CHECK_IN: new Date(this.checkIn),
      CHECK_OUT: new Date(this.checkOut),
      STATO: 'In attesa'
    };

    sessionStorage.setItem('prenotazione_pending', JSON.stringify(nuova));
    sessionStorage.setItem('caparra', String(this.caparra));
    this.router.navigate(['/pagamento']);
  }
}