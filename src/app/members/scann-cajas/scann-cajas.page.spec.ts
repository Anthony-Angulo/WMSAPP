import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannCajasPage } from './scann-cajas.page';

describe('ScannCajasPage', () => {
  let component: ScannCajasPage;
  let fixture: ComponentFixture<ScannCajasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScannCajasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannCajasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
