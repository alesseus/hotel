import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../login/Services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  // ── Stato modale ───────────────────────────────────────────────
  mostraModale  = false;
  invioInCorso  = false;
  invioRiuscito = false;
  erroreInvio   = '';

  // ── Campi form ─────────────────────────────────────────────────
  nuovaDescrizione = '';
  nuovoRating      = 0;
  ratingHover      = 0;

  // ── Auth ───────────────────────────────────────────────────────
  isLoggato(): boolean {
    return this.authService.isLoggedIn();
  }

  // ── Modale ────────────────────────────────────────────────────
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

  // ── Stelle ────────────────────────────────────────────────────
  setRating(valore: number): void  { this.nuovoRating = valore; }
  setHover(valore: number): void   { this.ratingHover = valore; }
  resetHover(): void               { this.ratingHover = 0; }

  stellaAttiva(indice: number): boolean {
    return indice <= (this.ratingHover || this.nuovoRating);
  }

  // ── Invio ─────────────────────────────────────────────────────
  inviaRecensione(form: NgForm): void {
    if (form.invalid || this.nuovoRating === 0) return;

    this.invioInCorso = true;
    this.erroreInvio  = '';

    const token = sessionStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      DESCRIZIONE: this.nuovaDescrizione.trim(),
      RATING:      this.nuovoRating,
      IDCLIENTE:   0   // il backend ricava l'ID dal JWT
    };

    this.http.post('https://hotel-4n9x.onrender.com/recensione/aggiungi', body, { headers }).subscribe({
      next: () => {
        this.invioInCorso  = false;
        this.invioRiuscito = true;
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

  resetForm(): void {
    this.nuovaDescrizione = '';
    this.nuovoRating      = 0;
    this.ratingHover      = 0;
    this.invioRiuscito    = false;
    this.erroreInvio      = '';
    this.invioInCorso     = false;
  }
}
