import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { GestisciPrenotazioneServices } from './Services/services';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';
import { stanza } from '../gestisci-stanza/interfacce/stanza_i';
import { servizio } from './interfacce/servizio_i';

@Component({
  selector: 'app-gestisci-prenotazione',
  imports: [RouterLink, FormsModule],
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
      (p.NOME   ?? '').toLowerCase().includes(q) ||
      (p.COGNOME ?? '').toLowerCase().includes(q) ||
      (p.EMAIL  ?? '').toLowerCase().includes(q) ||
      String(p.IDPRE).includes(q)
    );
  }

  // ── Modale nuova prenotazione ─────────────────────────────────
  modaleAperto = false;
  formError    = '';
  invio        = false;

  nuova: Partial<prenotazione> = this.prenotazioneVuota();

  // Dettaglio selezione dropdown
  stanzaSelezionata: stanza   | null = null;
  servizioSelezionato: servizio | null = null;

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.caricaTutto();
  }

  caricaTutto(): void {
    this.caricamento = true;
    this.erroreCaricamento = '';

    this.srv.getPrenotazioni().subscribe({
      next: (data) => { this.prenotazioni.set(data); this.caricamento = false; },
      error: (err) => {
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

  // ── Dropdown stanza ───────────────────────────────────────────
  onStanzaChange(id: number | null): void {
    this.stanzaSelezionata = id
      ? (this.stanze().find(s => s.IDSTANZA === +id) ?? null)
      : null;
  }

  // ── Dropdown servizio ─────────────────────────────────────────
  onServizioChange(id: number | null): void {
    this.servizioSelezionato = id
      ? (this.servizi().find(s => s.IDSERVIZIO === +id) ?? null)
      : null;
  }

  // ── Modale ────────────────────────────────────────────────────
  apriModale(): void {
    this.nuova = this.prenotazioneVuota();
    this.stanzaSelezionata   = null;
    this.servizioSelezionato = null;
    this.formError = '';
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
    this.nuova = this.prenotazioneVuota();
    this.stanzaSelezionata   = null;
    this.servizioSelezionato = null;
    this.formError = '';
  }

  salvaPrenotazione(form: NgForm): void {
    this.formError = '';

    if (form.invalid) {
      this.formError = 'Compila tutti i campi obbligatori.';
      return;
    }

    this.invio = true;

    this.srv.addPrenotazione(this.nuova).subscribe({
      next: () => {
        this.invio = false;
        this.chiudiModale();
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore salvataggio prenotazione', err);
        this.formError = 'Errore durante il salvataggio. Riprova.';
        this.invio = false;
      }
    });
  }

  // ── Utilità ───────────────────────────────────────────────────
  prenotazioneVuota(): Partial<prenotazione> {
    return {
      NOME: '', COGNOME: '', EMAIL: '', TELEFONO: '',
      DATANASCITA: undefined as any,
      IDSTANZA: undefined as any, IDSERVIZIO: undefined as any,
      TOTALE: undefined as any, SPA: false,
      NOTE: '', CHECK_IN: undefined as any, CHECK_OUT: undefined as any,
      STATO: ''
    };
  }

  formatData(dateStr: string | Date | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('it-IT');
  }
}
