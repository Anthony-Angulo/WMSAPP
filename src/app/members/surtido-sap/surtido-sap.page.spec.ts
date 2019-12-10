import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurtidoSapPage } from './surtido-sap.page';

describe('SurtidoSapPage', () => {
  let component: SurtidoSapPage;
  let fixture: ComponentFixture<SurtidoSapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurtidoSapPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurtidoSapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
