import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannInventoryPage } from './scann-inventory.page';

describe('ScannInventoryPage', () => {
  let component: ScannInventoryPage;
  let fixture: ComponentFixture<ScannInventoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScannInventoryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannInventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
