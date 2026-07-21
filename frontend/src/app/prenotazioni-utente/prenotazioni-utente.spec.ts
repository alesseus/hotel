import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrenotazioniUtente } from './prenotazioni-utente';

describe('PrenotazioniUtente', () => {
  let component: PrenotazioniUtente;
  let fixture: ComponentFixture<PrenotazioniUtente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrenotazioniUtente],
    }).compileComponents();

    fixture = TestBed.createComponent(PrenotazioniUtente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
