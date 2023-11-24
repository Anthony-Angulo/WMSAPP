import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannLabelPage } from './scann-label.page';

describe('ScannLabelPage', () => {
  let component: ScannLabelPage;
  let fixture: ComponentFixture<ScannLabelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScannLabelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannLabelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
