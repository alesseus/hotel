import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  codice    = '';
  password = '';
  loading  = false;
  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    // TODO: sostituire con chiamata reale al servizio di autenticazione
    setTimeout(() => {
      this.loading = false;

      if (this.codice === 'admin@bluehorizon.it' && this.password === 'admin123') {
        this.router.navigate(['/amministrazione']);
      } else {
        this.errorMessage = 'Credenziali non valide. Riprova.';
      }
    }, 800);
  }
}
