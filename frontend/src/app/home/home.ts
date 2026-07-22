import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../login/Services/auth.service';
import { ClienteServices } from '../gestisci-staff/Services/services';
import { cliente } from '../gestisci-staff/interfacce/cliente_i';
import { forkJoin } from 'rxjs';

interface Recensione {
  IDRECE: number;
  DESCRIZIONE: string;
  RATING: number;
  IDCLIENTE: number;
  NOME?: string;
  COGNOME?: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [ClienteServices],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private clienteServices: ClienteServices
  ) {}
  recensioni = signal<Recensione[]>([]);
  recensioniVisibili = signal<Recensione[]>([]);
  indiceCorrente = 0;
  caricamento = signal(true);
  private caroselloTimer: any;
  private readonly VISIBILI     = 3;
  private readonly INTERVALLO_MS = 5500;
  stellePerRating(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆');
  }
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

  ngOnDestroy(): void {
    this.fermaCarosello();
  }
  caricaRecensioni(): void {
    this.caricamento.set(true);

    forkJoin({
      recensioni: this.http.get<Recensione[]>('https://hotel-4n9x.onrender.com/recensione/lista'),
      clienti:    this.clienteServices.getClienti()
    }).subscribe({
      next: ({ recensioni, clienti }) => {
        const mapClienti = new Map<number, Pick<cliente, 'NOME' | 'COGNOME'>>();
        clienti.forEach(c => mapClienti.set(c.IDCLIENTE, { NOME: c.NOME, COGNOME: c.COGNOME }));
        const arricchite: Recensione[] = recensioni.map(r => ({
          ...r,
          NOME:    mapClienti.get(r.IDCLIENTE)?.NOME    ?? '',
          COGNOME: mapClienti.get(r.IDCLIENTE)?.COGNOME ?? ''
        }));

        this.caricamento.set(false);
        const mescolate = this.shuffle([...arricchite]);
        this.recensioni.set(mescolate);
        this.indiceCorrente = 0;
        this.aggiornaVisibili();
        if (mescolate.length > this.VISIBILI) {
          this.avviaCarosello();
        }
      },
      error: (err) => {
        this.caricamento.set(false);
        console.error('Errore caricamento recensioni/clienti', err);
      }
    });
  }
  avviaCarosello(): void {
    this.fermaCarosello();
    this.caroselloTimer = setInterval(() => {
      this.indiceCorrente = (this.indiceCorrente + 1) % this.recensioni().length;
      this.aggiornaVisibili();
    }, this.INTERVALLO_MS);
  }

  fermaCarosello(): void {
    if (this.caroselloTimer) {
      clearInterval(this.caroselloTimer);
      this.caroselloTimer = null;
    }
  }

  aggiornaVisibili(): void {
    const lista = this.recensioni();
    if (!lista.length) { this.recensioniVisibili.set([]); return; }
    const quante = Math.min(this.VISIBILI, lista.length);
    const visibili: Recensione[] = [];
    for (let i = 0; i < quante; i++) {
      visibili.push(lista[(this.indiceCorrente + i) % lista.length]);
    }
    this.recensioniVisibili.set(visibili);
  }
  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  isLoggato(): boolean { return this.authService.isLoggedIn(); }
  apriModale(): void {
    if (!this.isLoggato()) { this.router.navigate(['/login']); return; }
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
  setRating(valore: number): void  { this.nuovoRating.set(valore); }
  setHover(valore: number): void   { this.ratingHover.set(valore); }
  resetHover(): void               { this.ratingHover.set(0); }

  stellaAttiva(indice: number): boolean {
    return indice <= (this.ratingHover() || this.nuovoRating());
  }
  inviaRecensione(form: NgForm): void {
    if (form.invalid || this.nuovoRating() === 0) return;

    this.invioInCorso.set(true);
    this.erroreInvio.set('');

    const idCliente = parseInt(sessionStorage.getItem('token') ?? '0', 10);

    const body = {
      DESCRIZIONE: this.nuovaDescrizione().trim(),
      RATING:      this.nuovoRating(),
      IDCLIENTE:   idCliente
    };

    this.http.post('https://hotel-4n9x.onrender.com/recensione/add', body, {}).subscribe({
      next: () => {
        this.invioInCorso.set(false);
        this.invioRiuscito.set(true);
        this.fermaCarosello();
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
}
