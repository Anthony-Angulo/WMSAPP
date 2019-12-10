import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsSapPage } from './products-sap.page';

describe('ProductsSapPage', () => {
  let component: ProductsSapPage;
  let fixture: ComponentFixture<ProductsSapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsSapPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsSapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
