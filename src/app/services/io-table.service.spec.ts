import { TestBed, inject } from '@angular/core/testing';

import { IoTableService } from './io-table.service';

describe('IoTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IoTableService]
    });
  });

  it('should be created', inject([IoTableService], (service: IoTableService) => {
    expect(service).toBeTruthy();
  }));
});
