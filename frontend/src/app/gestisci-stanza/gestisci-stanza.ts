import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { StanzaServices } from './Services/services';
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
  ricerca           = signal('');
  caricamento       = signal(true);
  erroreCaricamento = signal('');

  // ── Modale ────────────────────────────────────────────────────
  modaleAperto   = signal(false);
  modaleModalita = signal<'crea' | 'modifica'>('crea');
  formError      = signal('');
  invio          = signal(false);

  // Stanza in creazione/modifica sul form
  stanzaForm: Partial<stanza> = {};

  // ── Conferma eliminazione ────────────────────────────────────
  eliminaTarget = signal<stanza | null>(null);

  ngOnInit(): void {
    this.caricaStanze();
  }

  caricaStanze(): void {
    this.caricamento.set(true);
    this.erroreCaricamento.set('');
    this.stanzaServices.getStanze().subscribe({
      next: (data) => {
        this.stanze.set(data);
        this.caricamento.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento stanze', err);
        this.erroreCaricamento.set('Impossibile caricare le stanze. Riprova più tardi.');
        this.caricamento.set(false);
      }
    });
  }

  // ── Filtro ricerca ────────────────────────────────────────────
  get stanzeFiltrate(): stanza[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.stanze();
    return this.stanze().filter(s =>
      (s.DESCRIZIONE ?? '').toLowerCase().includes(q) ||
      (s.DIMENSIONE  ?? '').toLowerCase().includes(q) ||
      String(s.IDSTANZA).includes(q)
    );
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
      STATO:       'Libera'
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
          this.formError.set('Errore durante la creazione della stanza.');
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
          this.formError.set('Errore durante l\'aggiornamento della stanza.');
          this.invio.set(false);
        }
      });
    }
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
