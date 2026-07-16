import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dovesiamo } from './dovesiamo';

describe('Dovesiamo', () => {
  let component: Dovesiamo;
  let fixture: ComponentFixture<Dovesiamo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dovesiamo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dovesiamo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
