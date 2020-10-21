import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtiquetasPage } from './etiquetas.page';

describe('EtiquetasPage', () => {
  let component: EtiquetasPage;
  let fixture: ComponentFixture<EtiquetasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtiquetasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtiquetasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
