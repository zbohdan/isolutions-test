import { TestBed } from '@angular/core/testing';

import { FindUserService } from './find-user.service';

describe('FindUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FindUserService = TestBed.get(FindUserService);
    expect(service).toBeTruthy();
  });
});
