import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HanldersComponent} from './hanlders.component';

describe('HanldersComponent', () =>
{
  let component: HanldersComponent;
  let fixture: ComponentFixture<HanldersComponent>;

  beforeEach(async () =>
  {
    await TestBed.configureTestingModule({
      declarations: [HanldersComponent]
    })
      .compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(HanldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
