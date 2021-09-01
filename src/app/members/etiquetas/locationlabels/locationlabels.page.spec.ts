import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationlabelsPage } from './locationlabels.page';

describe('LocationlabelsPage', () => {
  let component: LocationlabelsPage;
  let fixture: ComponentFixture<LocationlabelsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationlabelsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationlabelsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
