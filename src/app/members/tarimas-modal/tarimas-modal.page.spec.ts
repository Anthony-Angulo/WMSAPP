import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarimasModalPage } from './tarimas-modal.page';

describe('TarimasModalPage', () => {
  let component: TarimasModalPage;
  let fixture: ComponentFixture<TarimasModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarimasModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarimasModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
