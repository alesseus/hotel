import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PrenotazioneServices]
})
export class Prenotazione implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly API = 'https://hotel-4n9x.onrender.com';
  private readonly router = inject(Router);

  constructor(private _PrenotazioneServices: PrenotazioneServices) {}

  step = 0;
  tipoPrenotazione: 'spa' | 'stanza' | '' = '';
  formError = '';
  confermata = false;
  invio = false;

  tutteLeStanze = signal<stanza[]>([]);
  serviziDisponibili = signal<servizio[]>([]);
  listaPrenotazioni = signal<prenotazione[]>([]);

  filtroCapacita: number | null = null;
  filtroPrezzo: 'asc' | 'desc' | null = null;

  get checkOutMin(): string {
    if (!this.checkIn) return '';
    const d = new Date(this.checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  onCheckInChange(): void {
    if (this.checkOut && this.checkIn && this.checkOut <= this.checkIn) {
      this.checkOut = '';
    }
    this.stanzaSelezionata = null;
  }

  onCheckOutChange(): void {
    this.stanzaSelezionata = null;
  }

  get stanzeDisponibili(): stanza[] {
    const ci = this.checkIn ? new Date(this.checkIn) : null;
    const co = this.checkOut ? new Date(this.checkOut) : null;

    let risultato = this.tutteLeStanze().filter(s => {
      const stato = s.STATO?.toLowerCase() ?? '';

      if (stato === 'manutenzione' || stato === 'occupata') return false;

      if (ci && co && co > ci) {
        const conflitto = this.listaPrenotazioni().some(p => {
          if (p.IDSTANZA !== s.IDSTANZA) return false;
          if (p.STATO?.toLowerCase() === 'cancellata') return false;
          const pCi = p.CHECK_IN ? new Date(p.CHECK_IN) : null;
          const pCo = p.CHECK_OUT ? new Date(p.CHECK_OUT) : null;
          if (!pCi || !pCo) return false;
          return ci < pCo && co > pCi;
        });
        return !conflitto;
      }

      return stato === 'libera';
    });

    if (this.filtroCapacita) {
      risultato = risultato.filter(s => s.CAPACITA >= this.filtroCapacita!);
    }
    if (this.filtroPrezzo === 'asc') {
      risultato = [...risultato].sort((a, b) => a.COSTO - b.COSTO);
    } else if (this.filtroPrezzo === 'desc') {
      risultato = [...risultato].sort((a, b) => b.COSTO - a.COSTO);
    }
    return risultato;
  }

  resetFiltri(): void {
    this.filtroCapacita = null;
    this.filtroPrezzo = null;
  }

  stanzaSelezionata: stanza | null = null;
  serviziSelezionati: servizio[] = [];

  nome = '';
  cognome = '';
  email = '';
  telefono = '';
  dataNascita = '';
  checkIn = '';
  checkOut = '';
  note = '';

  ngOnInit(): void {
    this.caricaStanze();
    this.caricaServizi();
    this.http.get<prenotazione[]>(`${this.API}/prenotazione/lista`).subscribe({
      next: (data) => this.listaPrenotazioni.set(data),
      error: (err) => console.error('Errore caricamento prenotazioni', err)
    });
  }

  caricaStanze(): void {
    this.http.get<stanza[]>(`${this.API}/stanza/elenco`).subscribe({
      next: (data) => this.tutteLeStanze.set(data),
      error: (err) => console.error('Errore caricamento stanze', err)
    });
  }

  caricaServizi(): void {
    this.http.get<servizio[]>(`${this.API}/servizio/elenco`).subscribe({
      next: (data) => this.serviziDisponibili.set(data),
      error: (err) => console.error('Errore caricamento servizi', err)
    });
  }

  scegliTipo(tipo: 'spa' | 'stanza'): void {
    this.tipoPrenotazione = tipo;
    if (tipo === 'spa') {
      this.stanzaSelezionata = null;
      this.ospiti = [];
      this.serviziSelezionati = [];
    
    }
    this.step = tipo === 'spa' ? 3 : 1;
  }

  selezionaStanza(s: stanza): void {
    this.stanzaSelezionata = s;
    this.aggiornaOspiti();
    this.step = 2;
  }

  ospiti: { nome: string; cognome: string }[] = [];

  get numeroOspitiAggiuntivi(): number {
    if (this.tipoPrenotazione !== 'stanza' || !this.stanzaSelezionata) return 0;
    return Math.max(0, (this.stanzaSelezionata.CAPACITA ?? 1) - 1);
  }

  private aggiornaOspiti(): void {
    const n = this.numeroOspitiAggiuntivi;
    const nuovi: { nome: string; cognome: string }[] = [];
    for (let i = 0; i < n; i++) {
      nuovi.push(this.ospiti[i] ?? { nome: '', cognome: '' });
    }
    this.ospiti = nuovi;
  }

  private buildOspiti(): string {
    const lista: string[] = [];
    const intest = `${this.nome} ${this.cognome}`.trim();
    if (intest) lista.push(intest);
    for (const o of this.ospiti) {
      const full = `${o.nome} ${o.cognome}`.trim();
      if (full) lista.push(full);
    }
    return lista.join(', ');
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
  
  const ospitiCompilati = this.ospiti.filter(o => o.nome.trim() || o.cognome.trim()).length;
  const moltiplicatore = 1 + ospitiCompilati;
  
  return (this.stanzaSelezionata.COSTO * moltiplicatore) * this.notti;
}

  get costoServizi(): number {
    return this.serviziSelezionati.reduce((sum, s) => sum + s.COSTO, 0);
  }

  get spaServizio(): servizio | undefined {
    return this.serviziDisponibili().find(s =>
      s.NOTE?.toUpperCase().replace(/\./g, '') === 'SPA'
    );
  }

  get costoSpa(): number {
    return this.spaServizio?.COSTO ?? 0;
  }

  get totale(): number {
    if (this.tipoPrenotazione === 'spa') return this.costoSpa;
    return this.costoStanza + this.costoServizi;
  }

  get caparra(): number {
    return +(this.totale * 0.10).toFixed(2);
  }

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

    if (this.tipoPrenotazione === 'spa' && !this.checkIn) {
      this.formError = 'Seleziona la data della visita SPA.';
      return;
    }

    const nuova: prenotazione = {
      IDPRE: 0,
      NOME: this.nome,
      COGNOME: this.cognome,
      EMAIL: this.email,
      TELEFONO: this.telefono,
      DATANASCITA: this.dataNascita ? new Date(this.dataNascita) : null,
      IDSTANZA: this.tipoPrenotazione === 'stanza' ? (this.stanzaSelezionata?.IDSTANZA ?? null) : null,
      IDSERVIZIO: this.tipoPrenotazione === 'spa'
        ? (this.spaServizio?.IDSERVIZIO ?? null)
        : (this.serviziSelezionati[0]?.IDSERVIZIO ?? null),
      TOTALE: this.totale,
      CAPARRA: this.caparra,
      SPA: this.tipoPrenotazione === 'spa',
      NOTE: this.note?.trim() || (this.tipoPrenotazione === 'spa' ? 'solo spa' : ''),
      CHECK_IN: this.checkIn ? new Date(this.checkIn) : null,
      CHECK_OUT: this.checkOut ? new Date(this.checkOut) : null,
      STATO: 'In attesa',
      OSPITI: this.buildOspiti()
    };


    sessionStorage.setItem('prenotazione_pending', JSON.stringify(nuova));
    sessionStorage.setItem('caparra', String(this.caparra));
    this.router.navigate(['/pagamento']);
  }
}