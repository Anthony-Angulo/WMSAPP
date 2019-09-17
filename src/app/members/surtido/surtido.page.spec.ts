import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurtidoPage } from './surtido.page';

describe('SurtidoPage', () => {
  let component: SurtidoPage;
  let fixture: ComponentFixture<SurtidoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurtidoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurtidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
