import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

export interface RegisterPayload {
  nome: string;
  cognome: string;
  email: string;
  passwordHash: string;
  telefono: string;
  dataNascita: string;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confermaPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

function etaMinimaValidator(ctrl: AbstractControl): ValidationErrors | null {
  if (!ctrl.value) return null;
  const nascita = new Date(ctrl.value);
  const oggi = new Date();
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const mese = oggi.getMonth() - nascita.getMonth();
  if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) eta--;
  return eta >= 18 ? null : { etaMinima: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  isLoading      = signal(false);
  successMessage = signal('');
  errorMessage   = signal('');
  showPassword         = signal(false);
  showConfermaPassword = signal(false);

  maxDate = new Date().toISOString().split('T')[0];

  private apiUrl = 'https://hotel-4n9x.onrender.com/auth/register';

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'\-]+$/)]],
        cognome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'\-]+$/)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]+$/)]],
        confermaPassword: ['', Validators.required],
        telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-(). ]{7,20}$/)]],
        dataNascita: ['', [Validators.required, etaMinimaValidator]],
      },
      { validators: passwordMatchValidator }
    );
  }

  get f() { return this.registerForm.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfermaPassword(): void { this.showConfermaPassword.update(v => !v); }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { nome, cognome, email, password, telefono, dataNascita } = this.registerForm.value;

    const payload: RegisterPayload = {
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password,
      telefono: telefono.trim(),
      dataNascita,
    };

    this.http.post<{ message: string }>(this.apiUrl, payload)
      .pipe(timeout(40000))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Registrazione completata!');
          this.registerForm.reset();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.status === 409
            ? 'Questa email è già registrata.'
            : (err?.error?.message ?? 'Si è verificato un errore durante la registrazione. Riprova più tardi.'));
        }
      });
  }
}
