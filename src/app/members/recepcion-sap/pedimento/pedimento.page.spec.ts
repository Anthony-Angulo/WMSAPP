import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedimentoPage } from './pedimento.page';

describe('PedimentoPage', () => {
  let component: PedimentoPage;
  let fixture: ComponentFixture<PedimentoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedimentoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedimentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
