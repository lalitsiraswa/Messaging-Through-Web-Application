import {TestBed} from '@angular/core/testing';

import {DashboadGuardGuard} from './dashboad-guard.guard';

describe('DashboadGuardGuard', () =>
{
  let guard: DashboadGuardGuard;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DashboadGuardGuard);
  });

  it('should be created', () =>
  {
    expect(guard).toBeTruthy();
  });
});
