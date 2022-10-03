import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DirectmessagescomponentComponent} from './directmessagescomponent.component';

describe('DirectmessagescomponentComponent', () =>
{
  let component: DirectmessagescomponentComponent;
  let fixture: ComponentFixture<DirectmessagescomponentComponent>;

  beforeEach(async () =>
  {
    await TestBed.configureTestingModule({
      declarations: [DirectmessagescomponentComponent]
    })
      .compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(DirectmessagescomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
