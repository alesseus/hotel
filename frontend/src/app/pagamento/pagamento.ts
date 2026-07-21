import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PrenotazioneServices } from '../prenotazione/Services/services';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';
import emailjs from '@emailjs/browser';

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

  metodoPagamento: 'carta' | 'bonifico' | '' = '';

  nomeTitolare = '';
  numeroCarta  = '';
  scadenza     = '';
  cvv          = '';

  stato: 'form' | 'loading' | 'successo' | 'errore' = 'form';
  erroreMsg = '';
  conto = 3;

  constructor(
    private router: Router,
    private prenotazioneServices: PrenotazioneServices,
    private cdr: ChangeDetectorRef
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

  formatScadenza(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    input.value = val;
    this.scadenza = val;
  }

  scadenzaValida(): boolean {
    if (this.metodoPagamento !== 'carta') return true;
    if (!/^\d{2}\/\d{2}$/.test(this.scadenza)) return false;
    const [mm, yy] = this.scadenza.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const annoCorrente = now.getFullYear() % 100;
    const meseCorrente = now.getMonth() + 1;
    if (yy < annoCorrente) return false;
    if (yy === annoCorrente && mm < meseCorrente) return false;
    return true;
  }

  private inviaMailConferma(): void {
    const p = this.prenotazionePending!;
    emailjs.send(
      'service_cvv0ac7',
      'template_lphmeb9',
      {
        nome: p.NOME,
        cognome: p.COGNOME,
        email: p.EMAIL,
        check_in: p.CHECK_IN,
        check_out: p.CHECK_OUT,
        totale: p.TOTALE,
        caparra: p.CAPARRA
      },
      'm2OvObid_6Nr8hcx3'
    ).then(
      () => console.log('Mail inviata'),
      (err) => console.error('Errore mail:', err)
    );
  }

  paga(form: NgForm): void {
    if (form.invalid || !this.scadenzaValida()) return;

    this.stato = 'loading';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.prenotazioneServices.postUtente(this.prenotazionePending!).subscribe({
        next: (res) => {
          this.inviaMailConferma();
          sessionStorage.removeItem('prenotazione_pending');
          sessionStorage.removeItem('caparra');
          this.stato = 'successo';
          this.conto = 3;
          this.cdr.detectChanges();

          const interval = setInterval(() => {
            this.conto--;
            this.cdr.detectChanges();
            if (this.conto === 0) {
              clearInterval(interval);
              this.router.navigate(['/']);
            }
          }, 1000);
        },
        error: (err) => {
          this.stato = 'errore';
          this.erroreMsg = 'Errore durante la conferma della prenotazione. Riprova.';
          this.cdr.detectChanges();
        }
      });
    }, 800);
  }

  annulla(): void {
    sessionStorage.removeItem('prenotazione_pending');
    sessionStorage.removeItem('caparra');
    this.router.navigate(['/prenotazione']);
  }
}