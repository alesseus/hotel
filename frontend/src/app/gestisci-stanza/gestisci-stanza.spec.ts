import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestisciStanza } from './gestisci-stanza';

describe('GestisciStanza', () => {
  let component: GestisciStanza;
  let fixture: ComponentFixture<GestisciStanza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestisciStanza],
    }).compileComponents();

    fixture = TestBed.createComponent(GestisciStanza);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
