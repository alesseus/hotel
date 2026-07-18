import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Amministrazione } from './amministrazione';

describe('Amministrazione', () => {
  let component: Amministrazione;
  let fixture: ComponentFixture<Amministrazione>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Amministrazione],
    }).compileComponents();

    fixture = TestBed.createComponent(Amministrazione);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
