import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Scangs1Component } from './scangs1.component';

describe('Scangs1Component', () => {
  let component: Scangs1Component;
  let fixture: ComponentFixture<Scangs1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scangs1Component ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scangs1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
