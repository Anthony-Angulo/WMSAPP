import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialInventoryDetailPage } from './partial-inventory-detail.page';

describe('PartialInventoryDetailPage', () => {
  let component: PartialInventoryDetailPage;
  let fixture: ComponentFixture<PartialInventoryDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialInventoryDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialInventoryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
