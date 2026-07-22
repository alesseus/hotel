import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ClienteServices } from './Services/services';
import { cliente } from './interfacce/cliente_i';

@Component({
  selector: 'app-gestisci-staff',
  imports: [RouterLink, FormsModule],
  templateUrl: './gestisci-staff.html',
  styleUrl: './gestisci-staff.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestisciStaff implements OnInit {

  private readonly clienteServices = inject(ClienteServices);
  utenti            = signal<cliente[]>([]);
  ricerca           = signal('');
  caricamento       = signal(true);
  erroreCaricamento = signal('');
  modaleAperto   = signal(false);
  modaleModalita = signal<'crea' | 'modifica'>('crea');
  formError      = signal('');
  invio          = signal(false);

  utenteForm: Partial<cliente> = {};
  mostraPassword = signal(false);
  private passwordOriginale = '';
  eliminaTarget = signal<cliente | null>(null);
  get utentiFiltrati(): cliente[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.utenti();
    return this.utenti().filter(u =>
      (u.MAIL ?? '').toLowerCase().includes(q) ||
      (u.NOME ?? '').toLowerCase().includes(q) ||
      (u.COGNOME ?? '').toLowerCase().includes(q) ||
      String(u.IDCLIENTE).includes(q)
    );
  }

  ngOnInit(): void {
    this.caricaUtenti();
  }

  caricaUtenti(): void {
    this.caricamento.set(true);
    this.erroreCaricamento.set('');
    this.clienteServices.getClienti().subscribe({
      next: (data) => {
        this.utenti.set(data);
        this.caricamento.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento utenti', err);
        this.erroreCaricamento.set('Impossibile caricare gli utenti. Riprova più tardi.');
        this.caricamento.set(false);
      }
    });
  }
  apriModaleCreazione(): void {
    this.modaleModalita.set('crea');
    this.utenteForm = { NOME: '', COGNOME: '', MAIL: '', PASS: '', TELEFONO: '', DATANASCITA: '', ADMIN: false };
    this.passwordOriginale = '';
    this.formError.set('');
    this.mostraPassword.set(false);
    this.modaleAperto.set(true);
  }

  apriModaleModifica(u: cliente): void {
    this.modaleModalita.set('modifica');
    this.utenteForm = { ...u, PASS: '' };
    this.passwordOriginale = u.PASS;
    this.formError.set('');
    this.mostraPassword.set(false);
    this.modaleAperto.set(true);
  }

  chiudiModale(): void {
    this.modaleAperto.set(false);
    this.utenteForm = {};
    this.passwordOriginale = '';
    this.formError.set('');
    this.mostraPassword.set(false);
  }
  salvaUtente(form: NgForm): void {
    this.formError.set('');
    if (form.invalid) {
      this.formError.set('Compila tutti i campi obbligatori.');
      return;
    }
    this.invio.set(true);

    if (this.modaleModalita() === 'crea') {
      this.clienteServices.addCliente(this.utenteForm).subscribe({
        next: (nuovo) => {
          this.utenti.update(lista => [...lista, nuovo]);
          this.invio.set(false);
          this.chiudiModale();
        },
        error: (err) => {
          console.error('Errore creazione utente', err);
          this.formError.set('Errore durante il salvataggio. Riprova.');
          this.invio.set(false);
        }
      });
    } else {
      const daInviare: cliente = {
        ...(this.utenteForm as cliente),
        PASS: this.utenteForm.PASS ? this.utenteForm.PASS : this.passwordOriginale
      };

      this.clienteServices.aggiornaCliente(daInviare).subscribe({
        next: (aggiornato) => {
          this.utenti.update(lista =>
            lista.map(u => u.IDCLIENTE === aggiornato.IDCLIENTE ? aggiornato : u)
          );
          this.invio.set(false);
          this.chiudiModale();
        },
        error: (err) => {
          console.error('Errore salvataggio utente', err);
          this.formError.set('Errore durante il salvataggio. Riprova.');
          this.invio.set(false);
        }
      });
    }
  }
  chiediConfermaEliminazione(u: cliente): void { this.eliminaTarget.set(u); }
  annullaEliminazione(): void                  { this.eliminaTarget.set(null); }

  confermaEliminazione(): void {
    const target = this.eliminaTarget();
    if (!target) return;
    this.clienteServices.eliminaCliente(target.IDCLIENTE).subscribe({
      next: () => {
        this.utenti.update(lista => lista.filter(u => u.IDCLIENTE !== target.IDCLIENTE));
        this.eliminaTarget.set(null);
      },
      error: (err) => {
        console.error('Errore eliminazione utente', err);
        this.eliminaTarget.set(null);
        this.erroreCaricamento.set("Errore durante l'eliminazione. Riprova.");
      }
    });
  }
}
