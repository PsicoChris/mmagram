import { TestBed } from '@angular/core/testing';
import { MmaDataService } from './mma-data';

describe('MmaDataService', () => {
  let service: MmaDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MmaDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
