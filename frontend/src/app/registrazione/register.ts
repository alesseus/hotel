import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

/** Dati inviati al backend */
export interface RegisterPayload {
  nome: string;
  cognome: string;
  email: string;
  passwordHash: string; // SHA-256 pre-invio; il backend applica bcrypt/Argon2
  telefono: string;
  dataNascita: string;  // ISO: YYYY-MM-DD
}

/** Hash SHA-256 via Web Crypto API (nativo browser, zero dipendenze) */
async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Le due password devono coincidere */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confermaPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

/** Età minima 18 anni */
function etaMinimaValidator(ctrl: AbstractControl): ValidationErrors | null {
  if (!ctrl.value) return null;
  const nascita = new Date(ctrl.value);
  const oggi    = new Date();
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
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  isLoading           = false;
  successMessage      = '';
  errorMessage        = '';
  showPassword        = false;
  showConfermaPassword = false;

  /** Limite superiore del datepicker: oggi */
  maxDate = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        nome: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-ZÀ-ÿ\s'\-]+$/),
          ],
        ],
        cognome: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-ZÀ-ÿ\s'\-]+$/),
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email, Validators.maxLength(100)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(128),
            // almeno 1 maiusc, 1 minusc, 1 cifra, 1 simbolo
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]+$/
            ),
          ],
        ],
        confermaPassword: ['', Validators.required],
        telefono: [
          '',
          [Validators.required, Validators.pattern(/^\+?[\d\s\-(). ]{7,20}$/)],
        ],
        dataNascita: ['', [Validators.required, etaMinimaValidator]],
      },
      { validators: passwordMatchValidator }
    );
  }

  /** Scorciatoia per i controlli nel template */
  get f() {
    return this.registerForm.controls;
  }

  /** Ritorna true se il campo è invalido e l'utente lo ha già toccato */
  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  togglePassword():         void { this.showPassword        = !this.showPassword; }
  toggleConfermaPassword(): void { this.showConfermaPassword = !this.showConfermaPassword; }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading     = true;
    this.successMessage = '';
    this.errorMessage   = '';

    try {
      const { nome, cognome, email, password, telefono, dataNascita } =
        this.registerForm.value;

      // Hash SHA-256 lato client prima dell'invio HTTPS
      // Il backend deve aggiungere bcrypt/Argon2 prima di salvare nel DB
      const passwordHash = await sha256(password);

      const payload: RegisterPayload = {
        nome:         nome.trim(),
        cognome:      cognome.trim(),
        email:        email.trim().toLowerCase(),
        passwordHash,
        telefono:     telefono.trim(),
        dataNascita,
      };

      // ---------------------------------------------------------------
      // Sostituire con la chiamata reale al backend, es.:
      //   const result = await firstValueFrom(
      //     this.http.post<{ message: string }>('/api/auth/register', payload)
      //   );
      // ---------------------------------------------------------------
      console.log('Payload registrazione:', payload);
      await new Promise(resolve => setTimeout(resolve, 900)); // simulazione

      this.successMessage =
        "Registrazione completata! Controlla la tua email per confermare l'account.";
      this.registerForm.reset();
    } catch {
      this.errorMessage =
        'Si è verificato un errore durante la registrazione. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }
}
