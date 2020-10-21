import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicacionesPage } from './ubicaciones.page';

describe('UbicacionesPage', () => {
  let component: UbicacionesPage;
  let fixture: ComponentFixture<UbicacionesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UbicacionesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbicacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
