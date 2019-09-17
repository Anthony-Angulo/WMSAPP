import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullInventoryPage } from './full-inventory.page';

describe('FullInventoryPage', () => {
  let component: FullInventoryPage;
  let fixture: ComponentFixture<FullInventoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullInventoryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullInventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
