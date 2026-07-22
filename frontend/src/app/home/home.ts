import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../login/Services/auth.service';

interface Recensione {
  IDRECE: number;
  DESCRIZIONE: string;
  RATING: number;
  IDCLIENTE: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  // ── Carosello recensioni ───────────────────────────────────────
  recensioni = signal<Recensione[]>([]);
  recensioniVisibili = signal<Recensione[]>([]);   // 3 card visibili
  indiceCorrente = 0;
  private caroselloTimer: any;
  private readonly VISIBILI = 3;                   // card mostrate
  private readonly INTERVALLO_MS = 4000;           // 4 sec tra scorrimenti

  // ── Stelle helper ─────────────────────────────────────────────
  stellePerRating(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆');
  }

  // ── Stato modale ───────────────────────────────────────────────
  mostraModale  = false;
  invioInCorso  = false;
  invioRiuscito = false;
  erroreInvio   = '';

  // ── Campi form ─────────────────────────────────────────────────
  nuovaDescrizione = '';
  nuovoRating      = 0;
  ratingHover      = 0;

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.caricaRecensioni();
  }

  ngOnDestroy(): void {
    this.fermaCarosello();
  }

  // ── Caricamento DB ────────────────────────────────────────────
  caricaRecensioni(): void {
    this.http.get<Recensione[]>('https://hotel-4n9x.onrender.com/recensione/lista').subscribe({
      next: (data) => {
        // Shuffle casuale all'avvio
        const mescolate = this.shuffle([...data]);
        this.recensioni.set(mescolate);
        this.indiceCorrente = 0;
        this.aggiornaVisibili();
        if (mescolate.length > this.VISIBILI) {
          this.avviaCarosello();
        }
      },
      error: (err) => console.error('Errore caricamento recensioni', err)
    });
  }

  // ── Carosello ─────────────────────────────────────────────────
  avviaCarosello(): void {
    this.caroselloTimer = setInterval(() => {
      const lista = this.recensioni();
      this.indiceCorrente = (this.indiceCorrente + 1) % lista.length;
      this.aggiornaVisibili();
    }, this.INTERVALLO_MS);
  }

  fermaCarosello(): void {
    if (this.caroselloTimer) {
      clearInterval(this.caroselloTimer);
    }
  }

  aggiornaVisibili(): void {
    const lista = this.recensioni();
    if (!lista.length) return;
    const visibili: Recensione[] = [];
    for (let i = 0; i < this.VISIBILI; i++) {
      visibili.push(lista[(this.indiceCorrente + i) % lista.length]);
    }
    this.recensioniVisibili.set(visibili);
  }

  // ── Fisher-Yates shuffle ──────────────────────────────────────
  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

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

  // ── Invio recensione ──────────────────────────────────────────
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
      IDCLIENTE:   0
    };

    this.http.post('https://hotel-4n9x.onrender.com/recensione/aggiungi', body, { headers }).subscribe({
      next: () => {
        this.invioInCorso  = false;
        this.invioRiuscito = true;
        // Ricarica le recensioni così la nuova appare nel carosello
        this.fermaCarosello();
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

  resetForm(): void {
    this.nuovaDescrizione = '';
    this.nuovoRating      = 0;
    this.ratingHover      = 0;
    this.invioRiuscito    = false;
    this.erroreInvio      = '';
    this.invioInCorso     = false;
  }
}
