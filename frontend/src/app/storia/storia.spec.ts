import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Storia } from './storia';

describe('Storia', () => {
  let component: Storia;
  let fixture: ComponentFixture<Storia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Storia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Storia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
