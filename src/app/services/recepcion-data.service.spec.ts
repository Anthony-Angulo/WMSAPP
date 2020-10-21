import { TestBed } from '@angular/core/testing';

import { RecepcionDataService } from './recepcion-data.service';

describe('RecepcionDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecepcionDataService = TestBed.get(RecepcionDataService);
    expect(service).toBeTruthy();
  });
});
