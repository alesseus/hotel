import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recensioni } from './recensioni';

describe('Recensioni', () => {
  let component: Recensioni;
  let fixture: ComponentFixture<Recensioni>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recensioni],
    }).compileComponents();

    fixture = TestBed.createComponent(Recensioni);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
