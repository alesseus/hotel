import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { GestisciPrenotazioneServices } from './Services/services';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';
import { stanza } from '../gestisci-stanza/interfacce/stanza_i';
import { servizio } from './interfacce/servizio_i';

@Component({
  selector: 'app-gestisci-prenotazione',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './gestisci-prenotazione.html',
  styleUrl: './gestisci-prenotazione.css',
  providers: [GestisciPrenotazioneServices]
})
export class GestisciPrenotazione implements OnInit {

  private readonly srv = inject(GestisciPrenotazioneServices);

  // ── Dati ──────────────────────────────────────────────────────
  prenotazioni = signal<prenotazione[]>([]);
  stanze       = signal<stanza[]>([]);
  servizi      = signal<servizio[]>([]);

  caricamento       = true;
  erroreCaricamento = '';

  // ── Ricerca ───────────────────────────────────────────────────
  ricerca = '';

  get prenotazioniFiltrate(): prenotazione[] {
    const q = this.ricerca.trim().toLowerCase();
    if (!q) return this.prenotazioni();
    return this.prenotazioni().filter(p =>
      (p.NOME    ?? '').toLowerCase().includes(q) ||
      (p.COGNOME ?? '').toLowerCase().includes(q) ||
      (p.EMAIL   ?? '').toLowerCase().includes(q) ||
      String(p.IDPRE).includes(q)
    );
  }

  // ── Modale form (crea / modifica) ─────────────────────────────
  modaleAperto = false;
  modalita: 'crea' | 'modifica' = 'crea';
  formError = '';
  invio     = false;

  form: Partial<prenotazione> = this.vuota();

  stanzaSelezionata:   stanza   | null = null;
  servizioSelezionato: servizio | null = null;

  // ── Modale conferma elimina ───────────────────────────────────
  eliminaTarget: prenotazione | null = null;
  eliminaInCorso = false;

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.caricaTutto(); }

  caricaTutto(): void {
    this.caricamento = true;
    this.erroreCaricamento = '';

    this.srv.getPrenotazioni().subscribe({
      next:  (data) => { this.prenotazioni.set(data); this.caricamento = false; },
      error: (err)  => {
        console.error('Errore caricamento prenotazioni', err);
        this.erroreCaricamento = 'Impossibile caricare le prenotazioni. Riprova più tardi.';
        this.caricamento = false;
      }
    });

    this.srv.getStanze().subscribe({
      next:  (data) => this.stanze.set(data),
      error: (err)  => console.error('Errore caricamento stanze', err)
    });

    this.srv.getServizi().subscribe({
      next:  (data) => this.servizi.set(data),
      error: (err)  => console.error('Errore caricamento servizi', err)
    });
  }

  // ── Dropdown helpers ──────────────────────────────────────────
  onStanzaChange(id: number | null): void {
    this.stanzaSelezionata = id
      ? (this.stanze().find(s => s.IDSTANZA === +id) ?? null)
      : null;
  }

  onServizioChange(id: number | null): void {
    this.servizioSelezionato = id
      ? (this.servizi().find(s => s.IDSERVIZIO === +id) ?? null)
      : null;
  }

  // ── Apertura modali ───────────────────────────────────────────
  apriModaleCreazione(): void {
    this.modalita = 'crea';
    this.form = this.vuota();
    this.stanzaSelezionata   = null;
    this.servizioSelezionato = null;
    this.formError = '';
    this.modaleAperto = true;
  }

  apriModaleModifica(p: prenotazione): void {
    this.modalita = 'modifica';
    // Copia tutti i campi (incluse le date come stringhe ISO per i date input)
    this.form = {
      ...p,
      DATANASCITA: this.toDateInputString(p.DATANASCITA),
      CHECK_IN:    this.toDateInputString(p.CHECK_IN),
      CHECK_OUT:   this.toDateInputString(p.CHECK_OUT),
    } as any;
    this.stanzaSelezionata   = this.stanze().find(s => s.IDSTANZA === p.IDSTANZA) ?? null;
    this.servizioSelezionato = this.servizi().find(s => s.IDSERVIZIO === p.IDSERVIZIO) ?? null;
    this.formError = '';
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
    this.form = this.vuota();
    this.stanzaSelezionata   = null;
    this.servizioSelezionato = null;
    this.formError = '';
  }

  // ── Salva (crea o modifica) ───────────────────────────────────
  salva(ngForm: NgForm): void {
    this.formError = '';
    if (ngForm.invalid) { this.formError = 'Compila tutti i campi obbligatori.'; return; }

    this.invio = true;

    const obs = this.modalita === 'crea'
      ? this.srv.addPrenotazione(this.form)
      : this.srv.cambiaPrenotazione(this.form as prenotazione);

    obs.subscribe({
      next: () => {
        this.invio = false;
        this.chiudiModale();
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore salvataggio', err);
        this.formError = 'Errore durante il salvataggio. Riprova.';
        this.invio = false;
      }
    });
  }

  // ── Elimina ───────────────────────────────────────────────────
  apriConfermaEliminazione(p: prenotazione): void {
    this.eliminaTarget = p;
  }

  annullaEliminazione(): void {
    this.eliminaTarget = null;
  }

  confermaEliminazione(): void {
    if (!this.eliminaTarget) return;
    this.eliminaInCorso = true;

    this.srv.cancellaPrenotazione(this.eliminaTarget.IDPRE).subscribe({
      next: () => {
        this.eliminaInCorso = false;
        this.eliminaTarget = null;
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore eliminazione', err);
        this.eliminaInCorso = false;
        this.eliminaTarget = null;
        this.erroreCaricamento = 'Errore durante l\'eliminazione. Riprova.';
      }
    });
  }

  // ── Utilità ───────────────────────────────────────────────────
  vuota(): Partial<prenotazione> {
    return {
      NOME: '', COGNOME: '', EMAIL: '', TELEFONO: '',
      DATANASCITA: '' as any,
      IDSTANZA: null as any, IDSERVIZIO: null as any,
      TOTALE: null as any, SPA: false,
      NOTE: '', CHECK_IN: '' as any, CHECK_OUT: '' as any,
      STATO: ''
    };
  }

  formatData(d: string | Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT');
  }

  /** Converte una data ISO (es. "2026-08-01T00:00:00.000Z") in "YYYY-MM-DD" per <input type="date"> */
  private toDateInputString(d: string | Date | undefined): string {
    if (!d) return '';
    return new Date(d).toISOString().slice(0, 10);
  }
}
