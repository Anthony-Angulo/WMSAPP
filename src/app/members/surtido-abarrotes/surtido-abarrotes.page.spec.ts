import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurtidoAbarrotesPage } from './surtido-abarrotes.page';

describe('SurtidoAbarrotesPage', () => {
  let component: SurtidoAbarrotesPage;
  let fixture: ComponentFixture<SurtidoAbarrotesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurtidoAbarrotesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurtidoAbarrotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
