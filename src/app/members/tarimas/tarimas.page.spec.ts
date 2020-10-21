import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarimasPage } from './tarimas.page';

describe('TarimasPage', () => {
  let component: TarimasPage;
  let fixture: ComponentFixture<TarimasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarimasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarimasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
