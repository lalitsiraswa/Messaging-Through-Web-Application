import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreatehandlerComponent} from './createhandler.component';

describe('CreatehandlerComponent', () =>
{
  let component: CreatehandlerComponent;
  let fixture: ComponentFixture<CreatehandlerComponent>;

  beforeEach(async () =>
  {
    await TestBed.configureTestingModule({
      declarations: [CreatehandlerComponent]
    })
      .compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(CreatehandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
