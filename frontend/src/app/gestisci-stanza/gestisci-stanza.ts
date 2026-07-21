import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { StanzaServices, prenotazioneMin } from './Services/services';
import { stanza } from './interfacce/stanza_i';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-gestisci-stanza',
  imports: [RouterLink, FormsModule],
  templateUrl: './gestisci-stanza.html',
  styleUrl: './gestisci-stanza.css',
  providers: [StanzaServices]
})
export class GestisciStanza implements OnInit, OnDestroy {

  private readonly stanzaServices = inject(StanzaServices);
  private refreshSub?: Subscription;

  // ── Dati ──────────────────────────────────────────────────────
  stanze            = signal<stanza[]>([]);
  prenotazioni      = signal<prenotazioneMin[]>([]);
  ricerca           = signal('');
  caricamento       = signal(true);
  erroreCaricamento = signal('');

  // ── Filtro disponibilità per date (scelte dalle prenotazioni) ──
  filtroCheckIn  = signal('');
  filtroCheckOut = signal('');

  /** True quando entrambe le date sono selezionate e valide */
  get filtroAttivo(): boolean {
    return !!(this.filtroCheckIn() && this.filtroCheckOut() &&
              this.filtroCheckOut() > this.filtroCheckIn());
  }

  /** Date di check-in univoche dalle prenotazioni non cancellate */
  get checkInOptions(): string[] {
    return [...new Set(
      this.prenotazioni()
        .filter(p => p.STATO?.toLowerCase() !== 'cancellata' && p.CHECK_IN)
        .map(p => String(p.CHECK_IN).slice(0, 10))
    )].sort();
  }

  /** Date di check-out univoche, filtrando quelle > check-in selezionato */
  get checkOutOptions(): string[] {
    const ci = this.filtroCheckIn();
    return [...new Set(
      this.prenotazioni()
        .filter(p => {
          if (p.STATO?.toLowerCase() === 'cancellata') return false;
          if (!p.CHECK_OUT) return false;
          const co = String(p.CHECK_OUT).slice(0, 10);
          return !ci || co > ci;
        })
        .map(p => String(p.CHECK_OUT).slice(0, 10))
    )].sort();
  }

  onFiltroCheckInChange(): void {
    // Resetta check-out se non è più successivo al check-in
    if (this.filtroCheckOut() && this.filtroCheckIn() &&
        this.filtroCheckOut() <= this.filtroCheckIn()) {
      this.filtroCheckOut.set('');
    }
  }

  // ── Gruppi stanze per il filtro attivo ────────────────────────

  /** Stanze che hanno una prenotazione attiva che si sovrappone al periodo */
  get stanzeOccupatePeriodo(): stanza[] {
    if (!this.filtroAttivo) return [];
    const ci = new Date(this.filtroCheckIn());
    const co = new Date(this.filtroCheckOut());
    return this.stanze().filter(s => {
      if (s.STATO?.toLowerCase() === 'manutenzione') return false;
      return this.prenotazioni().some(p => {
        if (p.IDSTANZA !== s.IDSTANZA) return false;
        if (p.STATO?.toLowerCase() === 'cancellata') return false;
        const pCi = p.CHECK_IN  ? new Date(p.CHECK_IN)  : null;
        const pCo = p.CHECK_OUT ? new Date(p.CHECK_OUT) : null;
        if (!pCi || !pCo) return false;
        return ci < pCo && co > pCi;
      });
    });
  }

  /** Stanze senza conflitti di prenotazione nel periodo selezionato */
  get stanzeDisponibiliPeriodo(): stanza[] {
    if (!this.filtroAttivo) return [];
    const ci = new Date(this.filtroCheckIn());
    const co = new Date(this.filtroCheckOut());
    return this.stanze().filter(s => {
      if (s.STATO?.toLowerCase() === 'manutenzione') return false;
      return !this.prenotazioni().some(p => {
        if (p.IDSTANZA !== s.IDSTANZA) return false;
        if (p.STATO?.toLowerCase() === 'cancellata') return false;
        const pCi = p.CHECK_IN  ? new Date(p.CHECK_IN)  : null;
        const pCo = p.CHECK_OUT ? new Date(p.CHECK_OUT) : null;
        if (!pCi || !pCo) return false;
        return ci < pCo && co > pCi;
      });
    });
  }

  /** Stanze in manutenzione (indipendente dal filtro date) */
  get stanzeInManutenzione(): stanza[] {
    return this.stanze().filter(s => s.STATO?.toLowerCase() === 'manutenzione');
  }

  // ── Elenco generale (solo ricerca testuale, nessun filtro date) ─
  get stanzeFiltrate(): stanza[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.stanze();
    return this.stanze().filter(s =>
      (s.DESCRIZIONE ?? '').toLowerCase().includes(q) ||
      (s.DIMENSIONE  ?? '').toLowerCase().includes(q) ||
      String(s.IDSTANZA).includes(q)
    );
  }

  // ── Modale ────────────────────────────────────────────────────
  modaleAperto   = signal(false);
  modaleModalita = signal<'crea' | 'modifica'>('crea');
  formError      = signal('');
  invio          = signal(false);

  stanzaForm: Partial<stanza> = {};

  // ── Conferma eliminazione ────────────────────────────────────
  eliminaTarget = signal<stanza | null>(null);

  ngOnInit(): void {
    this.caricaStanze();
    // Auto-refresh ogni 60s per rispecchiare le prenotazioni effettuate
    this.refreshSub = interval(60000).subscribe(() => this.caricaStanze());
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  caricaStanze(): void {
    this.caricamento.set(true);
    this.erroreCaricamento.set('');
    this.stanzaServices.getStanze().subscribe({
      next: (data) => { this.stanze.set(data); this.caricamento.set(false); },
      error: (err) => {
        console.error('Errore caricamento stanze', err);
        this.erroreCaricamento.set('Impossibile caricare le stanze. Riprova più tardi.');
        this.caricamento.set(false);
      }
    });
    this.stanzaServices.getPrenotazioni().subscribe({
      next: (data) => this.prenotazioni.set(data),
      error: (err) => console.error('Errore caricamento prenotazioni', err)
    });
  }

  // ── Apertura modale ───────────────────────────────────────────
  apriModaleCreazione(): void {
    this.modaleModalita.set('crea');
    this.stanzaForm = {
      DESCRIZIONE: '',
      DIMENSIONE:  '',
      CAPACITA:    undefined,
      COSTO:       undefined,
      NOTE:        '',
      IMMAGINE:    ''
    };
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  apriModaleModifica(s: stanza): void {
    this.modaleModalita.set('modifica');
    this.stanzaForm = { ...s };
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  chiudiModale(): void {
    this.modaleAperto.set(false);
    this.stanzaForm = {};
    this.formError.set('');
  }

  // ── Salvataggio (crea o modifica) ────────────────────────────
  salvaStanza(form: NgForm): void {
    this.formError.set('');

    if (form.invalid) {
      this.formError.set('Compila tutti i campi obbligatori.');
      return;
    }

    this.invio.set(true);

    if (this.modaleModalita() === 'crea') {
      this.stanzaServices.addStanza(this.stanzaForm).subscribe({
        next: (lista) => {
          this.stanze.set(lista);
          this.invio.set(false);
          this.chiudiModale();
        },
        error: (err) => {
          console.error('Errore creazione stanza', err);
          this.formError.set(this.estraiMessaggioErrore(err, 'creazione'));
          this.invio.set(false);
        }
      });
    } else {
      this.stanzaServices.aggiornaStanza(this.stanzaForm as stanza).subscribe({
        next: (lista) => {
          this.stanze.set(lista);
          this.invio.set(false);
          this.chiudiModale();
        },
        error: (err) => {
          console.error('Errore aggiornamento stanza', err);
          this.formError.set(this.estraiMessaggioErrore(err, 'aggiornamento'));
          this.invio.set(false);
        }
      });
    }
  }

  private estraiMessaggioErrore(err: any, azione: string): string {
    const dettaglio =
      (typeof err?.error === 'string' && err.error) ||
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      '';
    const status = err?.status ? ` (HTTP ${err.status})` : '';
    return dettaglio
      ? `Errore durante l'${azione} della stanza${status}: ${dettaglio}`
      : `Errore durante l'${azione} della stanza${status}.`;
  }

  // ── Eliminazione ──────────────────────────────────────────────
  chiediConfermaEliminazione(s: stanza): void {
    this.eliminaTarget.set(s);
  }

  annullaEliminazione(): void {
    this.eliminaTarget.set(null);
  }

  confermaEliminazione(): void {
    const target = this.eliminaTarget();
    if (!target) return;

    this.stanzaServices.eliminaStanza(target.IDSTANZA).subscribe({
      next: (lista) => {
        this.stanze.set(lista);
        this.eliminaTarget.set(null);
      },
      error: (err) => {
        console.error('Errore eliminazione stanza', err);
        this.eliminaTarget.set(null);
        this.erroreCaricamento.set('Errore durante l\'eliminazione della stanza.');
      }
    });
  }

  // ── Utilità ───────────────────────────────────────────────────
  formatData(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT');
  }
}
