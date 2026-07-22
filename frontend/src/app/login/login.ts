import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {

  email = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor(private router: Router, private authService: AuthService) { }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.authService.salvaSessione(response);

        if (response.admin) {
          this.router.navigate(['/amministrazione']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Credenziali non valide. Riprova.');
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/amministrazione']);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }
}
