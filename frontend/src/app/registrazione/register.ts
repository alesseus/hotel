import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

// Interfaccia per i dati del form inviati al backend
export interface RegisterPayload {
  nome: string;
  cognome: string;
  email: string;
  passwordHash: string; // password già hashata con SHA-256 prima dell'invio
  telefono: string;
  dataNascita: string; // formato ISO: YYYY-MM-DD
}

/** Hash SHA-256 della password usando la Web Crypto API nativa del browser */
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Validator personalizzato: le due password devono coincidere */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confermaPassword = group.get('confermaPassword')?.value;
  return password === confermaPassword ? null : { passwordMismatch: true };
}

/** Validator: l'utente deve avere almeno 18 anni */
function etaMinimaValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.value) return null;
  const nascita = new Date(control.value);
  const oggi = new Date();
  const eta = oggi.getFullYear() - nascita.getFullYear();
  const mese = oggi.getMonth() - nascita.getMonth();
  const effettiva =
    mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())
      ? eta - 1
      : eta;
  return effettiva >= 18 ? null : { etaMinima: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  /** Stato dell'invio */
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  /** Visibilità delle password */
  showPassword = false;
  showConfermaPassword = false;

  /** Data massima selezionabile nel datepicker (oggi) */
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
            Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
          ],
        ],
        cognome: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
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
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]+$/
            ),
          ],
        ],
        confermaPassword: ['', Validators.required],
        telefono: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\+?[\d\s\-().]{7,20}$/),
          ],
        ],
        dataNascita: ['', [Validators.required, etaMinimaValidator]],
      },
      { validators: passwordMatchValidator }
    );
  }

  /** Helper per accedere ai controlli nel template */
  get f() {
    return this.registerForm.controls;
  }

  /** Restituisce true se il campo è invalido e toccato/sporco */
  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfermaPassword(): void {
    this.showConfermaPassword = !this.showConfermaPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const { nome, cognome, email, password, telefono, dataNascita } =
        this.registerForm.value;

      // Hash SHA-256 della password prima dell'invio al backend
      // Il backend dovrà applicare bcrypt/Argon2 per la persistenza definitiva
      const passwordHash = await hashPasswordSHA256(password);

      const payload: RegisterPayload = {
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        telefono: telefono.trim(),
        dataNascita,
      };

      // --- Sostituire con la chiamata HTTP al proprio backend ---
      // Esempio con HttpClient:
      //   this.http.post('/api/auth/register', payload).subscribe(...)
      console.log('Payload di registrazione:', payload);

      // Simulazione risposta backend (rimuovere in produzione)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.successMessage =
        'Registrazione completata! Controlla la tua email per confermare l\'account.';
      this.registerForm.reset();
    } catch {
      this.errorMessage =
        'Si è verificato un errore durante la registrazione. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }
}
