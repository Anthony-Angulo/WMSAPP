import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioCiclicoPage } from './inventario-ciclico.page';

describe('InventarioCiclicoPage', () => {
  let component: InventarioCiclicoPage;
  let fixture: ComponentFixture<InventarioCiclicoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventarioCiclicoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioCiclicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
