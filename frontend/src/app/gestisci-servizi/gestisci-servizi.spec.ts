import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestisciServizi } from './gestisci-servizi';

describe('GestisciServizi', () => {
  let component: GestisciServizi;
  let fixture: ComponentFixture<GestisciServizi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestisciServizi],
    }).compileComponents();

    fixture = TestBed.createComponent(GestisciServizi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
