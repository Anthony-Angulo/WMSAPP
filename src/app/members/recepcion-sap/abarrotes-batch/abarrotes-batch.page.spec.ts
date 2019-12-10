import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbarrotesBatchPage } from './abarrotes-batch.page';

describe('AbarrotesBatchPage', () => {
  let component: AbarrotesBatchPage;
  let fixture: ComponentFixture<AbarrotesBatchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbarrotesBatchPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbarrotesBatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
