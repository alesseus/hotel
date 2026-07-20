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
  stanze = signal<stanza[]>([]);
  ricerca = '';
  caricamento = true;
  erroreCaricamento = '';

  // ── Modale ────────────────────────────────────────────────────
  modaleAperto = false;
  modaleModalita: 'crea' | 'modifica' = 'crea';
  formError = '';
  invio = false;

  // Stanza in creazione/modifica sul form
  stanzaForm: Partial<stanza> = {};

  // ── Conferma eliminazione ────────────────────────────────────
  eliminaTarget: stanza | null = null;

  ngOnInit(): void {
    this.caricaStanze();
  }

  caricaStanze(): void {
    this.caricamento = true;
    this.erroreCaricamento = '';
    this.stanzaServices.getStanze().subscribe({
      next: (data) => {
        this.stanze.set(data);
        this.caricamento = false;
      },
      error: (err) => {
        console.error('Errore caricamento stanze', err);
        this.erroreCaricamento = 'Impossibile caricare le stanze. Riprova più tardi.';
        this.caricamento = false;
      }
    });
  }

  // ── Filtro ricerca ────────────────────────────────────────────
  get stanzeFiltrate(): stanza[] {
    const q = this.ricerca.trim().toLowerCase();
    if (!q) return this.stanze();
    return this.stanze().filter(s =>
      (s.DESCRIZIONE ?? '').toLowerCase().includes(q) ||
      (s.DIMENSIONE ?? '').toLowerCase().includes(q) ||
      String(s.IDSTANZA).includes(q)
    );
  }

  // ── Apertura modale ───────────────────────────────────────────
  apriModaleCreazione(): void {
    this.modaleModalita = 'crea';
    this.stanzaForm = {
      DESCRIZIONE: '',
      DIMENSIONE: '',
      CAPACITA: undefined,
      COSTO: undefined,
      NOTE: '',
      STATO: 'Libera'
    };
    this.formError = '';
    this.modaleAperto = true;
  }

  apriModaleModifica(s: stanza): void {
    this.modaleModalita = 'modifica';
    this.stanzaForm = { ...s };
    this.formError = '';
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
    this.stanzaForm = {};
    this.formError = '';
  }

  // ── Salvataggio (crea o modifica) ────────────────────────────
  salvaStanza(form: NgForm): void {
    this.formError = '';

    if (form.invalid) {
      this.formError = 'Compila tutti i campi obbligatori.';
      return;
    }

    this.invio = true;

    if (this.modaleModalita === 'crea') {
      this.stanzaServices.addStanza(this.stanzaForm).subscribe({
        next: (lista) => {
          this.stanze.set(lista);
          this.invio = false;
          this.chiudiModale();
        },
        error: (err) => {
          console.error('Errore creazione stanza', err);
          this.formError = 'Errore durante la creazione della stanza.';
          this.invio = false;
        }
      });
    } else {
      this.stanzaServices.aggiornaStanza(this.stanzaForm as stanza).subscribe({
        next: (lista) => {
          this.stanze.set(lista);
          this.invio = false;
          this.chiudiModale();
        },
        error: (err) => {
          console.error('Errore aggiornamento stanza', err);
          this.formError = 'Errore durante l\'aggiornamento della stanza.';
          this.invio = false;
        }
      });
    }
  }

  // ── Eliminazione ──────────────────────────────────────────────
  chiediConfermaEliminazione(s: stanza): void {
    this.eliminaTarget = s;
  }

  annullaEliminazione(): void {
    this.eliminaTarget = null;
  }

  confermaEliminazione(): void {
    if (!this.eliminaTarget) return;
    const id = this.eliminaTarget.IDSTANZA;

    this.stanzaServices.eliminaStanza(id).subscribe({
      next: (lista) => {
        this.stanze.set(lista);
        this.eliminaTarget = null;
      },
      error: (err) => {
        console.error('Errore eliminazione stanza', err);
        this.eliminaTarget = null;
        this.erroreCaricamento = 'Errore durante l\'eliminazione della stanza.';
      }
    });
  }
}