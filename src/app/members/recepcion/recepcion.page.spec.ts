import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionPage } from './recepcion.page';

describe('RecepcionPage', () => {
  let component: RecepcionPage;
  let fixture: ComponentFixture<RecepcionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepcionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
