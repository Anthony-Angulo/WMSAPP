import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialInventoryPage } from './partial-inventory.page';

describe('PartialInventoryPage', () => {
  let component: PartialInventoryPage;
  let fixture: ComponentFixture<PartialInventoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialInventoryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialInventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
