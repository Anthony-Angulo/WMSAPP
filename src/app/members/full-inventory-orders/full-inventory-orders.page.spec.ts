import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullInventoryOrdersPage } from './full-inventory-orders.page';

describe('FullInventoryOrdersPage', () => {
  let component: FullInventoryOrdersPage;
  let fixture: ComponentFixture<FullInventoryOrdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullInventoryOrdersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullInventoryOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
