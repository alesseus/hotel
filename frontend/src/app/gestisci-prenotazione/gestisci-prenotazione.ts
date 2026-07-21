import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { GestisciPrenotazioneServices } from './Services/services';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';
import { stanza } from '../gestisci-stanza/interfacce/stanza_i';
import { servizio } from './interfacce/servizio_i';
import { ServizioByIdPipe } from './pipes/servizio-by-id.pipe';

@Component({
  selector: 'app-gestisci-prenotazione',
  imports: [RouterLink, FormsModule, DecimalPipe, ServizioByIdPipe],
  templateUrl: './gestisci-prenotazione.html',
  styleUrl: './gestisci-prenotazione.css',
  providers: [GestisciPrenotazioneServices]
})
export class GestisciPrenotazione implements OnInit {

  private readonly srv = inject(GestisciPrenotazioneServices);

  // ── Dati (signal → change detection automatico) ───────────────
  prenotazioni = signal<prenotazione[]>([]);
  stanze       = signal<stanza[]>([]);
  servizi      = signal<servizio[]>([]);

  caricamento        = signal(true);
  erroreCaricamento  = signal('');

  // ── Ricerca ───────────────────────────────────────────────────
  ricerca = signal('');

  get prenotazioniFiltrate(): prenotazione[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.prenotazioni();
    return this.prenotazioni().filter(p =>
      (p.NOME    ?? '').toLowerCase().includes(q) ||
      (p.COGNOME ?? '').toLowerCase().includes(q) ||
      (p.EMAIL   ?? '').toLowerCase().includes(q) ||
      String(p.IDPRE).includes(q)
    );
  }

  // ── Modale form (crea / modifica) ─────────────────────────────
  modaleAperto = signal(false);
  modalita     = signal<'crea' | 'modifica'>('crea');
  formError    = signal('');
  invio        = signal(false);

  form: Partial<prenotazione> = this.vuota();

  stanzaSelezionata   = signal<stanza   | null>(null);
  servizioSelezionato = signal<servizio | null>(null);

  // ── Multi-servizio ────────────────────────────────────────────
  // Lista di IDSERVIZIO selezionati (uno per riga aggiunta)
  serviziSelezionati = signal<number[]>([]);

  get totaleCalcolato(): number {
    const stanza = this.stanzaSelezionata();
    const checkIn  = this.form.CHECK_IN  ? new Date(this.form.CHECK_IN as any)  : null;
    const checkOut = this.form.CHECK_OUT ? new Date(this.form.CHECK_OUT as any) : null;

    let notti = 0;
    if (checkIn && checkOut && checkOut > checkIn) {
      notti = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }

    const costoStanza = stanza ? (stanza.COSTO ?? 0) * notti : 0;

    const costoServizi = this.serviziSelezionati().reduce((acc, id) => {
      const sv = this.servizi().find(s => s.IDSERVIZIO === id);
      return acc + (sv ? (sv.COSTO ?? 0) : 0);
    }, 0);

    return costoStanza + costoServizi;
  }

  aggiungiServizio(): void {
    this.serviziSelezionati.update(list => [...list, null as any]);
  }

  rimuoviServizio(index: number): void {
    this.serviziSelezionati.update(list => list.filter((_, i) => i !== index));
  }

  aggiornaServizio(index: number, id: number | null): void {
    this.serviziSelezionati.update(list => {
      const copy = [...list];
      copy[index] = id as any;
      return copy;
    });
  }

  get serviziRows(): { index: number; idServizio: number | null }[] {
    return this.serviziSelezionati().map((id, i) => ({ index: i, idServizio: id }));
  }

  // ── Modale conferma elimina ───────────────────────────────────
  eliminaTarget  = signal<prenotazione | null>(null);
  eliminaInCorso = signal(false);

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.caricaTutto(); }

  caricaTutto(): void {
    this.caricamento.set(true);
    this.erroreCaricamento.set('');

    this.srv.getPrenotazioni().subscribe({
      next:  (data) => { this.prenotazioni.set(data); this.caricamento.set(false); },
      error: (err)  => {
        console.error('Errore caricamento prenotazioni', err);
        this.erroreCaricamento.set('Impossibile caricare le prenotazioni. Riprova più tardi.');
        this.caricamento.set(false);
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
    this.stanzaSelezionata.set(
      id ? (this.stanze().find(s => s.IDSTANZA === +id) ?? null) : null
    );
    this.aggiornaFormTotale();
  }

  onServizioChange(id: number | null): void {
    this.servizioSelezionato.set(
      id ? (this.servizi().find(s => s.IDSERVIZIO === +id) ?? null) : null
    );
  }

  onDataChange(): void {
    this.aggiornaFormTotale();
  }

  aggiornaFormTotale(): void {
    // Piccolo timeout per attendere che Angular aggiorni form.CHECK_IN / CHECK_OUT
    setTimeout(() => {
      this.form.TOTALE = this.totaleCalcolato;
    }, 0);
  }

  // ── Apertura modali ───────────────────────────────────────────
  apriModaleCreazione(): void {
    this.modalita.set('crea');
    this.form = this.vuota();
    this.stanzaSelezionata.set(null);
    this.servizioSelezionato.set(null);
    this.serviziSelezionati.set([]);
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  apriModaleModifica(p: prenotazione): void {
    this.modalita.set('modifica');
    this.form = {
      ...p,
      DATANASCITA: this.toDateInputString(p.DATANASCITA),
      CHECK_IN:    this.toDateInputString(p.CHECK_IN),
      CHECK_OUT:   this.toDateInputString(p.CHECK_OUT),
    } as any;
    this.stanzaSelezionata.set(this.stanze().find(s => s.IDSTANZA === p.IDSTANZA) ?? null);
    this.servizioSelezionato.set(this.servizi().find(s => s.IDSERVIZIO === p.IDSERVIZIO) ?? null);
    // Ripristina lista servizi: se la prenotazione ne aveva uno, lo precarica
    if (p.IDSERVIZIO) {
      this.serviziSelezionati.set([p.IDSERVIZIO]);
    } else {
      this.serviziSelezionati.set([]);
    }
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  chiudiModale(): void {
    this.modaleAperto.set(false);
    this.form = this.vuota();
    this.stanzaSelezionata.set(null);
    this.servizioSelezionato.set(null);
    this.serviziSelezionati.set([]);
    this.formError.set('');
  }

  // ── Salva (crea o modifica) ───────────────────────────────────
  salva(ngForm: NgForm): void {
    this.formError.set('');
    if (ngForm.invalid) { this.formError.set('Compila tutti i campi obbligatori.'); return; }

    this.invio.set(true);

    // Calcola il totale finale e lo include nel payload
    const totale = this.totaleCalcolato;
    // IDSERVIZIO: primo servizio della lista (compatibilità DB)
    const idServizioFirst = this.serviziSelezionati().find(id => id != null) ?? null;

    const payload: Partial<prenotazione> = {
      ...this.form,
      TOTALE:     totale,
      IDSERVIZIO: idServizioFirst as any,
      // Eventuali servizi aggiuntivi (se il backend li supporta)
      SERVIZI_IDS: this.serviziSelezionati().filter(id => id != null) as any,
    };

    const obs = this.modalita() === 'crea'
      ? this.srv.addPrenotazione(payload)
      : this.srv.cambiaPrenotazione(payload as prenotazione);

    obs.subscribe({
      next: () => {
        this.invio.set(false);
        this.chiudiModale();
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore salvataggio', err);
        this.formError.set('Errore durante il salvataggio. Riprova.');
        this.invio.set(false);
      }
    });
  }

  // ── Elimina ───────────────────────────────────────────────────
  apriConfermaEliminazione(p: prenotazione): void {
    this.eliminaTarget.set(p);
  }

  annullaEliminazione(): void {
    this.eliminaTarget.set(null);
  }

  confermaEliminazione(): void {
    const target = this.eliminaTarget();
    if (!target) return;
    this.eliminaInCorso.set(true);

    this.srv.cancellaPrenotazione(target.IDPRE).subscribe({
      next: () => {
        this.eliminaInCorso.set(false);
        this.eliminaTarget.set(null);
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore eliminazione', err);
        this.eliminaInCorso.set(false);
        this.eliminaTarget.set(null);
        this.erroreCaricamento.set('Errore durante l\'eliminazione. Riprova.');
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

  calcolaNotti(checkIn: any, checkOut: any): number {
    if (!checkIn || !checkOut) return 0;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (co <= ci) return 0;
    return Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatData(d: string | Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT');
  }

  private toDateInputString(d: string | Date | undefined): string {
    if (!d) return '';
    return new Date(d).toISOString().slice(0, 10);
  }
}
