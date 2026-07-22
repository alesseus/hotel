import { Component, OnInit, signal } from '@angular/core';
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
  providers: [RecensioneServices]
})
export class Recensioni implements OnInit {

  constructor(
    private _RecensioniService: RecensioneServices,
    private authService: AuthService,
    private router: Router
  ) {}

  listaRecensioni = signal(<Array<Recensione>>[]);

  // ── Modale stato ──────────────────────────────────────────────
  mostraModale = false;
  invioInCorso  = false;
  invioRiuscito = false;
  erroreInvio   = '';

  // ── Campi form recensione ──────────────────────────────────────
  nuovaDescrizione = '';
  nuovoRating      = 0;
  ratingHover      = 0;

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.caricaRecensioni();
  }

  caricaRecensioni(): void {
    this._RecensioniService.getUtenti().subscribe({
      next: (data) => this.listaRecensioni.set(data),
      error: (err) => console.error('Errore caricamento recensioni', err)
    });
  }

  // ── Auth helpers ───────────────────────────────────────────────
  isLoggato(): boolean {
    return this.authService.isLoggedIn();
  }

  // ── Gestione modale ────────────────────────────────────────────
  apriModale(): void {
    if (!this.isLoggato()) {
      this.router.navigate(['/login']);
      return;
    }
    this.resetForm();
    this.mostraModale = true;
    document.body.style.overflow = 'hidden';
  }

  chiudiModale(): void {
    this.mostraModale = false;
    document.body.style.overflow = '';
  }

  chiudiSuOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modale-overlay')) {
      this.chiudiModale();
    }
  }

  // ── Stelle interattive ─────────────────────────────────────────
  setRating(valore: number): void {
    this.nuovoRating = valore;
  }

  setHover(valore: number): void {
    this.ratingHover = valore;
  }

  resetHover(): void {
    this.ratingHover = 0;
  }

  stellaAttiva(indice: number): boolean {
    const riferimento = this.ratingHover || this.nuovoRating;
    return indice <= riferimento;
  }

  // ── Invio recensione ───────────────────────────────────────────
  inviaRecensione(form: NgForm): void {
    if (form.invalid || this.nuovoRating === 0) return;

    this.invioInCorso = true;
    this.erroreInvio  = '';

    const nuovaRecensione: Recensione = {
      IDRECE:      0,
      DESCRIZIONE: this.nuovaDescrizione.trim(),
      RATING:      this.nuovoRating,
      IDCLIENTE:   0   // il backend ricava l'ID dal token JWT
    };

    this._RecensioniService.postUtente(nuovaRecensione).subscribe({
      next: () => {
        this.invioInCorso  = false;
        this.invioRiuscito = true;
        this.caricaRecensioni();
        setTimeout(() => {
          this.chiudiModale();
          this.invioRiuscito = false;
        }, 1800);
      },
      error: () => {
        this.invioInCorso = false;
        this.erroreInvio  = 'Si è verificato un errore. Riprova più tardi.';
      }
    });
  }

  // ── Utility ────────────────────────────────────────────────────
  resetForm(): void {
    this.nuovaDescrizione = '';
    this.nuovoRating      = 0;
    this.ratingHover      = 0;
    this.invioRiuscito    = false;
    this.erroreInvio      = '';
    this.invioInCorso     = false;
  }

  stelleArray(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆');
  }
}
