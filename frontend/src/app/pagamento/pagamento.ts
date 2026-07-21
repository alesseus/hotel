import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PrenotazioneServices } from '../prenotazione/Services/services';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';

@Component({
  selector: 'app-pagamento',
  imports: [FormsModule],
  templateUrl: './pagamento.html',
  styleUrl: './pagamento.css',
  providers: [PrenotazioneServices]
})
export class Pagamento implements OnInit {

  caparra = 0;
  prenotazionePending: prenotazione | null = null;

  // Form carta
  nomeTitolare = '';
  numeroCarta  = '';
  scadenza     = '';
  cvv          = '';

  stato: 'form' | 'loading' | 'successo' | 'errore' = 'form';
  erroreMsg = '';

  constructor(
    private router: Router,
    private prenotazioneServices: PrenotazioneServices
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem('prenotazione_pending');
    const cap = sessionStorage.getItem('caparra');

    if (!raw || !cap) {
      this.router.navigate(['/prenotazione']);
      return;
    }

    this.prenotazionePending = JSON.parse(raw);
    this.caparra = parseFloat(cap);
  }

  paga(form: NgForm): void {
    if (form.invalid) return;

    this.stato = 'loading';

    // Simulazione pagamento (1.5s)
    setTimeout(() => {
      this.prenotazioneServices.postUtente(this.prenotazionePending!).subscribe({
        next: () => {
          sessionStorage.removeItem('prenotazione_pending');
          sessionStorage.removeItem('caparra');
          this.stato = 'successo';
          setTimeout(() => this.router.navigate(['/']), 3000);
        },
        error: () => {
          this.stato = 'errore';
          this.erroreMsg = 'Errore durante la conferma della prenotazione. Riprova.';
        }
      });
    }, 1500);
  }

  annulla(): void {
    sessionStorage.removeItem('prenotazione_pending');
    sessionStorage.removeItem('caparra');
    this.router.navigate(['/prenotazione']);
  }
}