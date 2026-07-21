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

  // ── Filtro per date dalle prenotazioni ────────────────────────
  filtroCheckIn  = signal('');
  filtroCheckOut = signal('');

  /** True quando entrambe le date sono selezionate e valide */
  get filtroAttivo(): boolean {
    return !!(this.filtroCheckIn() && this.filtroCheckOut() &&
              this.filtroCheckOut() > this.filtroCheckIn());
  }

  // ── Normalizzazione date (stringa YYYY-MM-DD, robusto vs UTC) ─
  private toDateStr(d: any): string {
    if (!d) return '';
    return String(d).slice(0, 10);
  }

  // ── Date uniche dalle prenotazioni attive ─────────────────────

  get checkInOptions(): string[] {
    return [...new Set(
      this.prenotazioni()
        .filter(p => p.STATO?.toLowerCase() !== 'cancellata' && p.CHECK_IN)
        .map(p => this.toDateStr(p.CHECK_IN))
    )].sort();
  }

  get checkOutOptions(): string[] {
    const ci = this.filtroCheckIn();
    return [...new Set(
      this.prenotazioni()
        .filter(p => {
          if (p.STATO?.toLowerCase() === 'cancellata') return false;
          if (!p.CHECK_OUT) return false;
          const co = this.toDateStr(p.CHECK_OUT);
          return !ci || co > ci;
        })
        .map(p => this.toDateStr(p.CHECK_OUT))
    )].sort();
  }

  onFiltroCheckInChange(): void {
    if (this.filtroCheckOut() && this.filtroCheckIn() &&
        this.filtroCheckOut() <= this.filtroCheckIn()) {
      this.filtroCheckOut.set('');
    }
  }

  // ── Verifica sovrapposizione (string YYYY-MM-DD, hotel convention) ─
  private haConflitto(
    ciSel: string, coSel: string,
    pCiRaw: any, pCoRaw: any
  ): boolean {
    const pCi = this.toDateStr(pCiRaw);
    const pCo = this.toDateStr(pCoRaw);
    if (!pCi || !pCo) return false;
    // Overlap: [ciSel, coSel) ∩ [pCi, pCo) ≠ ∅
    return ciSel < pCo && coSel > pCi;
  }

  // ── Gruppi stanze (attivi solo col filtro) ────────────────────

  /** Stanze che hanno prenotazioni attive sovrapposte al periodo */
  get stanzeOccupatePeriodo(): stanza[] {
    if (!this.filtroAttivo) return [];
    const ci = this.filtroCheckIn();
    const co = this.filtroCheckOut();
    return this.stanze().filter(s => {
      if (s.STATO?.toLowerCase() === 'manutenzione') return false;
      return this.prenotazioni().some(p => {
        if (+p.IDSTANZA !== s.IDSTANZA) return false;           // ← cast numerico
        if (p.STATO?.toLowerCase() === 'cancellata') return false;
        return this.haConflitto(ci, co, p.CHECK_IN, p.CHECK_OUT);
      });
    });
  }

  /** Stanze libere nel periodo (no sovrapposizioni, no manutenzione) */
  get stanzeDisponibiliPeriodo(): stanza[] {
    if (!this.filtroAttivo) return [];
    const ci = this.filtroCheckIn();
    const co = this.filtroCheckOut();
    return this.stanze().filter(s => {
      if (s.STATO?.toLowerCase() === 'manutenzione') return false;
      return !this.prenotazioni().some(p => {
        if (+p.IDSTANZA !== s.IDSTANZA) return false;
        if (p.STATO?.toLowerCase() === 'cancellata') return false;
        return this.haConflitto(ci, co, p.CHECK_IN, p.CHECK_OUT);
      });
    });
  }

  /** Stanze in manutenzione (sempre, indipendente dal periodo) */
  get stanzeInManutenzione(): stanza[] {
    return this.stanze().filter(s => s.STATO?.toLowerCase() === 'manutenzione');
  }

  // ── Elenco generale con sola ricerca testuale ─────────────────
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
    // Auto-refresh ogni 60s: rispecchia prenotazioni effettuate altrove
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
      DESCRIZIONE: '', DIMENSIONE: '',
      CAPACITA: undefined, COSTO: undefined,
      NOTE: '', IMMAGINE: ''
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

  // ── Salvataggio ───────────────────────────────────────────────
  salvaStanza(form: NgForm): void {
    this.formError.set('');
    if (form.invalid) { this.formError.set('Compila tutti i campi obbligatori.'); return; }
    this.invio.set(true);

    const obs = this.modaleModalita() === 'crea'
      ? this.stanzaServices.addStanza(this.stanzaForm)
      : this.stanzaServices.aggiornaStanza(this.stanzaForm as stanza);

    obs.subscribe({
      next: (lista) => { this.stanze.set(lista); this.invio.set(false); this.chiudiModale(); },
      error: (err) => {
        console.error('Errore salvataggio stanza', err);
        this.formError.set(this.estraiMessaggio(err, this.modaleModalita() === 'crea' ? 'creazione' : 'aggiornamento'));
        this.invio.set(false);
      }
    });
  }

  private estraiMessaggio(err: any, azione: string): string {
    const det =
      (typeof err?.error === 'string' && err.error) ||
      err?.error?.message || err?.error?.error || err?.message || '';
    const s = err?.status ? ` (HTTP ${err.status})` : '';
    return det
      ? `Errore durante l'${azione} della stanza${s}: ${det}`
      : `Errore durante l'${azione} della stanza${s}.`;
  }

  // ── Eliminazione ──────────────────────────────────────────────
  chiediConfermaEliminazione(s: stanza): void { this.eliminaTarget.set(s); }
  annullaEliminazione():                 void { this.eliminaTarget.set(null); }

  confermaEliminazione(): void {
    const t = this.eliminaTarget();
    if (!t) return;
    this.stanzaServices.eliminaStanza(t.IDSTANZA).subscribe({
      next: (lista) => { this.stanze.set(lista); this.eliminaTarget.set(null); },
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
    // Parso dalla stringa YYYY-MM-DD evitando timezone shift
    const [y, m, g] = d.split('-').map(Number);
    return new Date(y, m - 1, g).toLocaleDateString('it-IT');
  }
}
