import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ServizioServices } from './Services/services';
import { servizio } from './interfacce/servizi_i';

@Component({
  selector: 'app-gestisci-servizi',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './gestisci-servizi.html',
  styleUrl: './gestisci-servizi.css',
  providers: [ServizioServices]
})
export class GestisciServizi implements OnInit {

  private readonly servizioServices = inject(ServizioServices);

  // ── Dati ──────────────────────────────────────────────────────
  servizi = signal<servizio[]>([]);
  ricerca = '';
  caricamento = true;
  erroreCaricamento = '';

  // ── Modale ────────────────────────────────────────────────────
  modaleAperto = false;
  modaleModalita: 'crea' | 'modifica' = 'crea';
  formError = '';
  invio = false;

  servizioForm: Partial<servizio> = {};

  // ── Conferma eliminazione ────────────────────────────────────
  eliminaTarget: servizio | null = null;

  ngOnInit(): void {
    this.caricaServizi();
  }

  caricaServizi(): void {
    this.caricamento = true;
    this.erroreCaricamento = '';
    this.servizioServices.getServizi().subscribe({
      next: (data) => {
        this.servizi.set(data);
        this.caricamento = false;
      },
      error: (err) => {
        console.error('Errore caricamento servizi', err);
        this.erroreCaricamento = 'Impossibile caricare i servizi. Riprova più tardi.';
        this.caricamento = false;
      }
    });
  }

  // ── Filtro ricerca ────────────────────────────────────────────
  get serviziFiltrati(): servizio[] {
    const q = this.ricerca.trim().toLowerCase();
    if (!q) return this.servizi();
    return this.servizi().filter(s =>
      (s.NOTE ?? '').toLowerCase().includes(q) ||
      String(s.IDSERVIZIO).includes(q)
    );
  }

  // ── Apertura modale ───────────────────────────────────────────
  apriModaleCreazione(): void {
    this.modaleModalita = 'crea';
    this.servizioForm = { NOTE: '', COSTO: undefined };
    this.formError = '';
    this.modaleAperto = true;
  }

  apriModaleModifica(s: servizio): void {
    this.modaleModalita = 'modifica';
    this.servizioForm = { ...s };
    this.formError = '';
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
    this.servizioForm = {};
    this.formError = '';
  }

  // ── Salvataggio (crea o modifica) ────────────────────────────
  salvaServizio(form: NgForm): void {
    this.formError = '';
    if (form.invalid) {
      this.formError = 'Compila tutti i campi obbligatori.';
      return;
    }
    this.invio = true;

    if (this.modaleModalita === 'crea') {
      this.servizioServices.addServizio(this.servizioForm).subscribe({
        next: (lista) => { this.servizi.set(lista); this.invio = false; this.chiudiModale(); },
        error: (err) => { console.error(err); this.formError = 'Errore durante la creazione.'; this.invio = false; }
      });
    } else {
      this.servizioServices.aggiornaServizio(this.servizioForm as servizio).subscribe({
        next: (lista) => { this.servizi.set(lista); this.invio = false; this.chiudiModale(); },
        error: (err) => { console.error(err); this.formError = 'Errore durante l\'aggiornamento.'; this.invio = false; }
      });
    }
  }

  // ── Eliminazione ──────────────────────────────────────────────
  chiediConfermaEliminazione(s: servizio): void { this.eliminaTarget = s; }
  annullaEliminazione(): void { this.eliminaTarget = null; }

  confermaEliminazione(): void {
    if (!this.eliminaTarget) return;
    this.servizioServices.eliminaServizio(this.eliminaTarget.IDSERVIZIO).subscribe({
      next: (lista) => { this.servizi.set(lista); this.eliminaTarget = null; },
      error: (err) => { console.error(err); this.eliminaTarget = null; this.erroreCaricamento = 'Errore durante l\'eliminazione.'; }
    });
  }
}