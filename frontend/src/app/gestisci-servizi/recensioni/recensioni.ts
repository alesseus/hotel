import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RecensioneServices } from './Services/services';
import { AuthService } from '../login/Services/auth.service';
import { Recensione } from './interfacce/recensione';

@Component({
  selector: 'app-recensioni',
  imports: [FormsModule, RouterLink],
  templateUrl: './recensioni.html',
  styleUrl: './recensioni.css',
  providers: [RecensioneServices],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recensioni implements OnInit {

  constructor(
    private _RecensioniService: RecensioneServices,
    private authService: AuthService,
    private router: Router
  ) {}

  listaRecensioni = signal(<Array<Recensione>>[]);

  mostraModale  = signal(false);
  invioInCorso  = signal(false);
  invioRiuscito = signal(false);
  erroreInvio   = signal('');

  nuovaDescrizione = signal('');
  nuovoRating      = signal(0);
  ratingHover      = signal(0);

  ngOnInit(): void {
    this.caricaRecensioni();
  }

  caricaRecensioni(): void {
    this._RecensioniService.getUtenti().subscribe({
      next: (data) => this.listaRecensioni.set(data),
      error: (err) => console.error('Errore caricamento recensioni', err)
    });
  }

  isLoggato(): boolean {
    return this.authService.isLoggedIn();
  }

  apriModale(): void {
    if (!this.isLoggato()) {
      this.router.navigate(['/login']);
      return;
    }
    this.resetForm();
    this.mostraModale.set(true);
    document.body.style.overflow = 'hidden';
  }

  chiudiModale(): void {
    this.mostraModale.set(false);
    document.body.style.overflow = '';
  }

  chiudiSuOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modale-overlay')) {
      this.chiudiModale();
    }
  }

  setRating(valore: number): void { this.nuovoRating.set(valore); }
  setHover(valore: number): void  { this.ratingHover.set(valore); }
  resetHover(): void              { this.ratingHover.set(0); }

  stellaAttiva(indice: number): boolean {
    return indice <= (this.ratingHover() || this.nuovoRating());
  }

  inviaRecensione(form: NgForm): void {
    if (form.invalid || this.nuovoRating() === 0) return;

    this.invioInCorso.set(true);
    this.erroreInvio.set('');

    const nuovaRecensione: Recensione = {
      IDRECE:      0,
      DESCRIZIONE: this.nuovaDescrizione().trim(),
      RATING:      this.nuovoRating(),
      IDCLIENTE:   0
    };

    this._RecensioniService.postUtente(nuovaRecensione).subscribe({
      next: () => {
        this.invioInCorso.set(false);
        this.invioRiuscito.set(true);
        this.caricaRecensioni();
        setTimeout(() => {
          this.chiudiModale();
          this.invioRiuscito.set(false);
        }, 1800);
      },
      error: (err) => {
        this.invioInCorso.set(false);
        console.error('Errore invio recensione:', err.status, err.error);
        if (err.status === 401 || err.status === 403) {
          this.erroreInvio.set('Sessione scaduta. Effettua di nuovo il login.');
        } else if (err.status === 0) {
          this.erroreInvio.set('Impossibile raggiungere il server. Controlla la connessione.');
        } else {
          this.erroreInvio.set('Si è verificato un errore. Riprova più tardi.');
        }
      }
    });
  }

  resetForm(): void {
    this.nuovaDescrizione.set('');
    this.nuovoRating.set(0);
    this.ratingHover.set(0);
    this.invioRiuscito.set(false);
    this.erroreInvio.set('');
    this.invioInCorso.set(false);
  }

  stelleArray(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆');
  }
}
