import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestisciStaff } from './gestisci-staff';

describe('GestisciStaff', () => {
  let component: GestisciStaff;
  let fixture: ComponentFixture<GestisciStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestisciStaff],
    }).compileComponents();

    fixture = TestBed.createComponent(GestisciStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
