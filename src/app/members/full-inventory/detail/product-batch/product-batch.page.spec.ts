import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBatchPage } from './product-batch.page';

describe('ProductBatchPage', () => {
  let component: ProductBatchPage;
  let fixture: ComponentFixture<ProductBatchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductBatchPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductBatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
