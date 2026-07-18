import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestisciPrenotazione } from './gestisci-prenotazione';

describe('GestisciPrenotazione', () => {
  let component: GestisciPrenotazione;
  let fixture: ComponentFixture<GestisciPrenotazione>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestisciPrenotazione],
    }).compileComponents();

    fixture = TestBed.createComponent(GestisciPrenotazione);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
