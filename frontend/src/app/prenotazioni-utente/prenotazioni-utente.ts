import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../login/Services/auth.service';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';

@Component({
  selector: 'app-prenotazioni-utente',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './prenotazioni-utente.html',
  styleUrl: './prenotazioni-utente.css'
})
export class PrenotazioniUtente implements OnInit {

  private readonly API = 'https://hotel-4n9x.onrender.com/prenotazione';

  prenotazioni = signal<prenotazione[]>([]);
  caricamento = signal(true);
  errore = signal('');

  // Modale modifica
  modaleAperto = false;
  prenotazioneSelezionata: prenotazione | null = null;
  formNome = '';
  formCognome = '';
  formTelefono = '';
  formEmail = '';
  formOspiti: { nome: string; cognome: string }[] = [];
  invio = false;
  formError = '';


  // Modale conferma cancellazione
  cancellaTarget: prenotazione | null = null;
  cancellaInCorso = false;

  isLoggedIn = false;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    const mail = this.auth.getMail();

    if (!mail) {
      this.errore.set('Nessuna email trovata. Effettua il login.');
      this.caricamento.set(false);
      return;
    }

    this.http.get<prenotazione[]>(`${this.API}/mail/${mail}`).subscribe({
      next: (data) => {
        this.prenotazioni.set(data);
        this.caricamento.set(false);
      },
      error: () => {
        this.errore.set('Errore durante il caricamento delle prenotazioni.');
        this.caricamento.set(false);
      }
    });
  }

  // ── Modifica ──────────────────────────────────────────────────
  apriModifica(p: prenotazione): void {
    this.prenotazioneSelezionata = p;
    this.formNome = p.NOME;
    this.formCognome = p.COGNOME;
    this.formTelefono = p.TELEFONO;
    this.formEmail = p.EMAIL;
    this.formOspiti = this.parseOspiti(p.OSPITI);
    this.formError = '';
    this.modaleAperto = true;
  }

  // ── Ospiti ────────────────────────────────────────────────────
  aggiungiOspite(): void { this.formOspiti = [...this.formOspiti, { nome: '', cognome: '' }]; }
  rimuoviOspite(index: number): void { this.formOspiti = this.formOspiti.filter((_, i) => i !== index); }

  private parseOspiti(ospiti: string | undefined): { nome: string; cognome: string }[] {
    if (!ospiti) return [];
    return ospiti.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(full => {
        const parti = full.split(' ');
        return { nome: parti[0] ?? '', cognome: parti.slice(1).join(' ') };
      });
  }

  private buildOspiti(): string {
    return this.formOspiti
      .map(o => `${o.nome} ${o.cognome}`.trim())
      .filter(s => s.length > 0)
      .join(', ');
  }


  chiudiModale(): void {
    this.modaleAperto = false;
    this.prenotazioneSelezionata = null;
    this.formError = '';
  }

  salvaModifica(form: NgForm): void {
    if (form.invalid) return;
    this.invio = true;
    this.formError = '';

    const aggiornata: prenotazione = {
      ...this.prenotazioneSelezionata!,
      NOME: this.formNome,
      COGNOME: this.formCognome,
      TELEFONO: this.formTelefono,
      EMAIL: this.formEmail,
      OSPITI: this.buildOspiti()
    };


    this.http.put(`${this.API}/cambia`, aggiornata, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).subscribe({
      next: () => {
        this.invio = false;
        this.chiudiModale();
        this.prenotazioni.update(list =>
          list.map(p => p.IDPRE === aggiornata.IDPRE ? aggiornata : p)
        );
      },
      error: () => {
        this.invio = false;
        this.formError = 'Errore durante il salvataggio. Riprova.';
      }
    });
  }

  // ── Cancellazione ─────────────────────────────────────────────
  apriCancella(p: prenotazione): void {
    this.cancellaTarget = p;
  }

  annullaCancella(): void {
    this.cancellaTarget = null;
  }

  confermaCancella(): void {
    if (!this.cancellaTarget) return;
    this.cancellaInCorso = true;

    this.http.delete(`${this.API}/cancella/${this.cancellaTarget.IDPRE}`).subscribe({
      next: () => {
        this.prenotazioni.update(list =>
          list.filter(p => p.IDPRE !== this.cancellaTarget!.IDPRE)
        );
        this.cancellaTarget = null;
        this.cancellaInCorso = false;
      },
      error: () => {
        this.cancellaInCorso = false;
        this.cancellaTarget = null;
      }
    });
  }

  formatData(d: Date | string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT');
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}