import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServizioServices]
})
export class GestisciServizi implements OnInit {

  private readonly servizioServices = inject(ServizioServices);
  servizi          = signal<servizio[]>([]);
  ricerca          = signal('');
  caricamento      = signal(true);
  erroreCaricamento = signal('');
  modaleAperto    = signal(false);
  modaleModalita  = signal<'crea' | 'modifica'>('crea');
  formError       = signal('');
  invio           = signal(false);

  servizioForm: Partial<servizio> = {};
  eliminaTarget = signal<servizio | null>(null);

  ngOnInit(): void {
    this.caricaServizi();
  }

  caricaServizi(): void {
    this.caricamento.set(true);
    this.erroreCaricamento.set('');
    this.servizioServices.getServizi().subscribe({
      next: (data) => {
        this.servizi.set(data);
        this.caricamento.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento servizi', err);
        this.erroreCaricamento.set('Impossibile caricare i servizi. Riprova piÃ¹ tardi.');
        this.caricamento.set(false);
      }
    });
  }
  get serviziFiltrati(): servizio[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.servizi();
    return this.servizi().filter(s =>
      (s.NOTE ?? '').toLowerCase().includes(q) ||
      String(s.IDSERVIZIO).includes(q)
    );
  }
  apriModaleCreazione(): void {
    this.modaleModalita.set('crea');
    this.servizioForm = { NOTE: '', COSTO: 0 };
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  apriModaleModifica(s: servizio): void {
    this.modaleModalita.set('modifica');
    this.servizioForm = { ...s };
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  chiudiModale(): void {
    this.modaleAperto.set(false);
    this.servizioForm = {};
    this.formError.set('');
  }
  salvaServizio(form: NgForm): void {
    this.formError.set('');
    if (form.invalid) {
      this.formError.set('Compila tutti i campi obbligatori.');
      return;
    }
    this.invio.set(true);

    if (this.modaleModalita() === 'crea') {
      this.servizioServices.addServizio(this.servizioForm).subscribe({
        next: (lista) => { this.servizi.set(lista); this.invio.set(false); this.chiudiModale(); },
        error: (err) => { console.error(err); this.formError.set('Errore durante la creazione.'); this.invio.set(false); }
      });
    } else {
      this.servizioServices.aggiornaServizio(this.servizioForm as servizio).subscribe({
        next: (lista) => { this.servizi.set(lista); this.invio.set(false); this.chiudiModale(); },
        error: (err) => { console.error(err); this.formError.set('Errore durante l\'aggiornamento.'); this.invio.set(false); }
      });
    }
  }
  chiediConfermaEliminazione(s: servizio): void { this.eliminaTarget.set(s); }
  annullaEliminazione(): void { this.eliminaTarget.set(null); }

  confermaEliminazione(): void {
    const target = this.eliminaTarget();
    if (!target) return;
    this.servizioServices.eliminaServizio(target.IDSERVIZIO).subscribe({
      next: (lista) => { this.servizi.set(lista); this.eliminaTarget.set(null); },
      error: (err) => { console.error(err); this.eliminaTarget.set(null); this.erroreCaricamento.set('Errore durante l\'eliminazione.'); }
    });
  }
}
