import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtiquetasTransferenciasPage } from './etiquetas-transferencias.page';

describe('EtiquetasTransferenciasPage', () => {
  let component: EtiquetasTransferenciasPage;
  let fixture: ComponentFixture<EtiquetasTransferenciasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtiquetasTransferenciasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtiquetasTransferenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
