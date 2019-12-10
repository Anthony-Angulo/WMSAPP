import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbarrotesPage } from './abarrotes.page';

describe('AbarrotesPage', () => {
  let component: AbarrotesPage;
  let fixture: ComponentFixture<AbarrotesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbarrotesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbarrotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
