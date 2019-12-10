import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateEtiquetaPage } from './generate-etiqueta.page';

describe('GenerateEtiquetaPage', () => {
  let component: GenerateEtiquetaPage;
  let fixture: ComponentFixture<GenerateEtiquetaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateEtiquetaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateEtiquetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
