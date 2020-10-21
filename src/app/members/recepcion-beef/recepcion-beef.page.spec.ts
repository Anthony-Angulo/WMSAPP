import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionBeefPage } from './recepcion-beef.page';

describe('RecepcionBeefPage', () => {
  let component: RecepcionBeefPage;
  let fixture: ComponentFixture<RecepcionBeefPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepcionBeefPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionBeefPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
