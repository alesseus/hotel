import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { StanzaServices, prenotazioneMin } from './Services/services';
import { stanza } from './interfacce/stanza_i';

@Component({
  selector: 'app-gestisci-stanza',
  imports: [RouterLink, FormsModule],
  templateUrl: './gestisci-stanza.html',
  styleUrl: './gestisci-stanza.css',
  providers: [StanzaServices]
})
export class GestisciStanza implements OnInit {

  private readonly stanzaServices = inject(StanzaServices);

  // ── Dati ──────────────────────────────────────────────────────
  stanze            = signal<stanza[]>([]);
  prenotazioni      = signal<prenotazioneMin[]>([]);
  ricerca           = signal('');
  caricamento       = signal(true);
  erroreCaricamento = signal('');

  // ── Filtro disponibilità per date ─────────────────────────────
  filtroCheckIn  = signal('');
  filtroCheckOut = signal('');

  get filtroCheckOutMin(): string {
    const ci = this.filtroCheckIn();
    if (!ci) return '';
    const d = new Date(ci);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  onFiltroCheckInChange(): void {
    if (this.filtroCheckOut() && this.filtroCheckIn() && this.filtroCheckOut() <= this.filtroCheckIn()) {
      this.filtroCheckOut.set('');
    }
  }

  // ── Modale ────────────────────────────────────────────────────
  modaleAperto   = signal(false);
  modaleModalita = signal<'crea' | 'modifica'>('crea');
  formError      = signal('');
  invio          = signal(false);

  // Stanza in creazione/modifica sul form
  stanzaForm: Partial<stanza> = {};

  // Stati riconosciuti dal <select>: se lo STATO salvato in DB non è
  // esattamente uno di questi (es. spazi, maiuscole diverse, valore legacy),
  // il template aggiunge un'opzione extra per non invalidare il form.
  readonly statiValidi = ['Disponibile', 'Occupata', 'Manutenzione'];

  // ── Conferma eliminazione ────────────────────────────────────
  eliminaTarget = signal<stanza | null>(null);

  ngOnInit(): void {
    this.caricaStanze();
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

  // ── Filtro ricerca + disponibilità per date ───────────────────
  get stanzeFiltrate(): stanza[] {
    const q  = this.ricerca().trim().toLowerCase();
    const ci = this.filtroCheckIn();
    const co = this.filtroCheckOut();

    return this.stanze().filter(s => {
      // Filtro testo
      if (q && !(
        (s.DESCRIZIONE ?? '').toLowerCase().includes(q) ||
        (s.DIMENSIONE  ?? '').toLowerCase().includes(q) ||
        String(s.IDSTANZA).includes(q)
      )) return false;

      // Filtro date: se entrambe le date sono inserite
      if (ci && co && co > ci) {
        const nuovaCi = new Date(ci);
        const nuovaCo = new Date(co);

        // Stanza in manutenzione: sempre esclusa
        if (s.STATO?.toLowerCase() === 'manutenzione') return false;

        // Controlla sovrapposizione con prenotazioni attive
        const conflitto = this.prenotazioni().some(p => {
          if (p.IDSTANZA !== s.IDSTANZA) return false;
          if (p.STATO?.toLowerCase() === 'cancellata') return false;
          const pCi = p.CHECK_IN  ? new Date(p.CHECK_IN)  : null;
          const pCo = p.CHECK_OUT ? new Date(p.CHECK_OUT) : null;
          if (!pCi || !pCo) return false;
          return nuovaCi < pCo && nuovaCo > pCi;
        });
        return !conflitto;
      }

      return true;
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
      STATO:       'Libera',
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

  // Prova a recuperare il messaggio d'errore reale restituito dal backend,
  // così da capire davvero perché il salvataggio fallisce (es. validazione,
  // campo mancante, ecc.) invece di mostrare sempre un messaggio generico.
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
    const id = target.IDSTANZA;

    this.stanzaServices.eliminaStanza(id).subscribe({
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
}
