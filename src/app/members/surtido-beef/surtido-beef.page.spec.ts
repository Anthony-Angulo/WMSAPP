import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurtidoBeefPage } from './surtido-beef.page';

describe('SurtidoBeefPage', () => {
  let component: SurtidoBeefPage;
  let fixture: ComponentFixture<SurtidoBeefPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurtidoBeefPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurtidoBeefPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
