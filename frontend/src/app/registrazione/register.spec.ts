import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  // ---------------------------------------------------------------------------
  // Creazione componente
  // ---------------------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise the form with empty fields', () => {
    const { nome, cognome, email, password, confermaPassword, telefono, dataNascita } =
      component.registerForm.controls;
    expect(nome.value).toBe('');
    expect(cognome.value).toBe('');
    expect(email.value).toBe('');
    expect(password.value).toBe('');
    expect(confermaPassword.value).toBe('');
    expect(telefono.value).toBe('');
    expect(dataNascita.value).toBe('');
  });

  it('should be invalid when empty', () => {
    expect(component.registerForm.invalid).toBeTrue();
  });

  // ---------------------------------------------------------------------------
  // Validazione – Nome
  // ---------------------------------------------------------------------------
  describe('nome field', () => {
    it('should be invalid when empty', () => {
      component.f['nome'].setValue('');
      expect(component.f['nome'].hasError('required')).toBeTrue();
    });

    it('should be invalid with a single character', () => {
      component.f['nome'].setValue('A');
      expect(component.f['nome'].hasError('minlength')).toBeTrue();
    });

    it('should be invalid with special characters', () => {
      component.f['nome'].setValue('Mario123');
      expect(component.f['nome'].hasError('pattern')).toBeTrue();
    });

    it('should be valid with a proper name', () => {
      component.f['nome'].setValue('Mario');
      expect(component.f['nome'].valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Validazione – Cognome
  // ---------------------------------------------------------------------------
  describe('cognome field', () => {
    it('should be invalid when empty', () => {
      component.f['cognome'].setValue('');
      expect(component.f['cognome'].hasError('required')).toBeTrue();
    });

    it('should be valid with a proper surname', () => {
      component.f['cognome'].setValue('Rossi');
      expect(component.f['cognome'].valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Validazione – Email
  // ---------------------------------------------------------------------------
  describe('email field', () => {
    it('should be invalid when empty', () => {
      component.f['email'].setValue('');
      expect(component.f['email'].hasError('required')).toBeTrue();
    });

    it('should be invalid with a malformed email', () => {
      component.f['email'].setValue('not-an-email');
      expect(component.f['email'].hasError('email')).toBeTrue();
    });

    it('should be valid with a proper email', () => {
      component.f['email'].setValue('mario.rossi@email.it');
      expect(component.f['email'].valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Validazione – Password
  // ---------------------------------------------------------------------------
  describe('password field', () => {
    it('should be invalid when empty', () => {
      component.f['password'].setValue('');
      expect(component.f['password'].hasError('required')).toBeTrue();
    });

    it('should be invalid when shorter than 8 chars', () => {
      component.f['password'].setValue('Ab1@');
      expect(component.f['password'].hasError('minlength')).toBeTrue();
    });

    it('should be invalid without uppercase letter', () => {
      component.f['password'].setValue('password1@');
      expect(component.f['password'].hasError('pattern')).toBeTrue();
    });

    it('should be invalid without a digit', () => {
      component.f['password'].setValue('Password@');
      expect(component.f['password'].hasError('pattern')).toBeTrue();
    });

    it('should be invalid without a special character', () => {
      component.f['password'].setValue('Password1');
      expect(component.f['password'].hasError('pattern')).toBeTrue();
    });

    it('should be valid with all requirements satisfied', () => {
      component.f['password'].setValue('Password1@');
      expect(component.f['password'].valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Validazione – Conferma Password
  // ---------------------------------------------------------------------------
  describe('password match validator', () => {
    it('should fail when passwords do not match', () => {
      component.f['password'].setValue('Password1@');
      component.f['confermaPassword'].setValue('Different1@');
      expect(component.registerForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('should pass when passwords match', () => {
      component.f['password'].setValue('Password1@');
      component.f['confermaPassword'].setValue('Password1@');
      expect(component.registerForm.hasError('passwordMismatch')).toBeFalse();
    });
  });

  // ---------------------------------------------------------------------------
  // Validazione – Telefono
  // ---------------------------------------------------------------------------
  describe('telefono field', () => {
    it('should be invalid when empty', () => {
      component.f['telefono'].setValue('');
      expect(component.f['telefono'].hasError('required')).toBeTrue();
    });

    it('should be invalid with letters in it', () => {
      component.f['telefono'].setValue('abc');
      expect(component.f['telefono'].hasError('pattern')).toBeTrue();
    });

    it('should be valid with an Italian mobile number', () => {
      component.f['telefono'].setValue('+39 333 123 4567');
      expect(component.f['telefono'].valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Validazione – Data di nascita
  // ---------------------------------------------------------------------------
  describe('dataNascita field', () => {
    it('should be invalid when empty', () => {
      component.f['dataNascita'].setValue('');
      expect(component.f['dataNascita'].hasError('required')).toBeTrue();
    });

    it('should reject users under 18', () => {
      const minorDate = new Date();
      minorDate.setFullYear(minorDate.getFullYear() - 17);
      component.f['dataNascita'].setValue(minorDate.toISOString().split('T')[0]);
      expect(component.f['dataNascita'].hasError('etaMinima')).toBeTrue();
    });

    it('should accept users who are exactly 18', () => {
      const exactDate = new Date();
      exactDate.setFullYear(exactDate.getFullYear() - 18);
      component.f['dataNascita'].setValue(exactDate.toISOString().split('T')[0]);
      expect(component.f['dataNascita'].valid).toBeTrue();
    });

    it('should accept users over 18', () => {
      component.f['dataNascita'].setValue('1990-06-15');
      expect(component.f['dataNascita'].valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Toggle visibilità password
  // ---------------------------------------------------------------------------
  describe('password visibility toggles', () => {
    it('should toggle showPassword', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
      component.togglePassword();
      expect(component.showPassword).toBeFalse();
    });

    it('should toggle showConfermaPassword', () => {
      expect(component.showConfermaPassword).toBeFalse();
      component.toggleConfermaPassword();
      expect(component.showConfermaPassword).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // Invio form
  // ---------------------------------------------------------------------------
  describe('onSubmit', () => {
    it('should mark all fields as touched when form is invalid', async () => {
      await component.onSubmit();
      Object.values(component.f).forEach((ctrl) => {
        expect(ctrl.touched).toBeTrue();
      });
    });

    it('should set isLoading to true during submission', fakeAsync(() => {
      // Riempi il form con dati validi
      component.f['nome'].setValue('Mario');
      component.f['cognome'].setValue('Rossi');
      component.f['email'].setValue('mario.rossi@email.it');
      component.f['password'].setValue('Password1@');
      component.f['confermaPassword'].setValue('Password1@');
      component.f['telefono'].setValue('+39 333 123 4567');
      component.f['dataNascita'].setValue('1990-06-15');

      component.onSubmit();
      expect(component.isLoading).toBeTrue();
      tick(1500); // attende la simulazione async
    }));
  });

  // ---------------------------------------------------------------------------
  // isInvalid helper
  // ---------------------------------------------------------------------------
  describe('isInvalid helper', () => {
    it('should return false for a pristine untouched field', () => {
      expect(component.isInvalid('nome')).toBeFalse();
    });

    it('should return true for a touched invalid field', () => {
      component.f['nome'].markAsTouched();
      expect(component.isInvalid('nome')).toBeTrue();
    });
  });
});
