import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email        = '';
  password     = '';
  loading      = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.authService.salvaSessione(response);

        if (response.admin) {
          this.router.navigate(['/amministrazione']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Credenziali non valide. Riprova.';
      }
    });
  }
}