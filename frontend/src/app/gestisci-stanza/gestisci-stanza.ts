import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StanzaServices]
})
export class GestisciStanza implements OnInit, OnDestroy {

  private readonly stanzaServices = inject(StanzaServices);
  private refreshSub?: Subscription;
  stanze            = signal<stanza[]>([]);
  prenotazioni      = signal<prenotazioneMin[]>([]);
  ricerca           = signal('');
  caricamento       = signal(true);
  erroreCaricamento = signal('');
  filtroCheckIn  = signal('');
  filtroCheckOut = signal('');

  
  get filtroAttivo(): boolean {
    return !!(this.filtroCheckIn() && this.filtroCheckOut() &&
              this.filtroCheckOut() > this.filtroCheckIn());
  }
  private toDateStr(d: any): string {
    if (!d) return '';
    const s = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const eu = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (eu) return `${eu[3]}-${eu[2].padStart(2, '0')}-${eu[1].padStart(2, '0')}`;
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const g = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${g}`;
    }
    return s.slice(0, 10);
  }

  get checkInOptions(): string[] {
    return [...new Set(
      this.prenotazioni()
        .filter(p => p.STATO?.toLowerCase() !== 'cancellata' && p.CHECK_IN)
        .map(p => this.toDateStr(p.CHECK_IN))
    )].sort();
  }

  
  get checkOutOptions(): string[] {
    const ci = this.filtroCheckIn();
    if (!ci) return [];
    return [...new Set(
      this.prenotazioni()
        .filter(p => {
          if (p.STATO?.toLowerCase() === 'cancellata') return false;
          if (!p.CHECK_OUT || !p.CHECK_IN) return false;
          return this.toDateStr(p.CHECK_IN) === ci;
        })
        .map(p => this.toDateStr(p.CHECK_OUT))
    )].sort();
  }

  onFiltroCheckInChange(): void {
    this.filtroCheckOut.set('');
  }
  private haConflitto(
    ciSel: string, coSel: string,
    pCiRaw: any, pCoRaw: any
  ): boolean {
    const pCi = this.toDateStr(pCiRaw);
    const pCo = this.toDateStr(pCoRaw);
    if (!pCi || !pCo) return false;
    return ciSel < pCo && coSel > pCi;
  }

  
  get stanzeOccupatePeriodo(): stanza[] {
    if (!this.filtroAttivo) return [];
    const ci = this.filtroCheckIn();
    const co = this.filtroCheckOut();
    return this.stanze().filter(s => {
      if (s.STATO?.toLowerCase() === 'manutenzione') return false;
      return this.prenotazioni().some(p => {
        if (+p.IDSTANZA !== s.IDSTANZA) return false;
        if (p.STATO?.toLowerCase() === 'cancellata') return false;
        return this.haConflitto(ci, co, p.CHECK_IN, p.CHECK_OUT);
      });
    });
  }

  
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

  
  get stanzeInManutenzione(): stanza[] {
    return this.stanze().filter(s => s.STATO?.toLowerCase() === 'manutenzione');
  }
  get stanzeFiltrate(): stanza[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.stanze();
    return this.stanze().filter(s =>
      (s.DESCRIZIONE ?? '').toLowerCase().includes(q) ||
      (s.DIMENSIONE  ?? '').toLowerCase().includes(q) ||
      String(s.IDSTANZA).includes(q)
    );
  }
  modaleAperto   = signal(false);
  modaleModalita = signal<'crea' | 'modifica'>('crea');
  formError      = signal('');
  invio          = signal(false);
  stanzaForm: Partial<stanza> = {};
  eliminaTarget = signal<stanza | null>(null);

  ngOnInit(): void {
    this.caricaStanze();
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
  formatData(d: string): string {
    if (!d) return '—';
    const [y, m, g] = d.split('-').map(Number);
    return new Date(y, m - 1, g).toLocaleDateString('it-IT');
  }
}
