import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ChannelscomponentComponent} from './channelscomponent.component';

describe('ChannelscomponentComponent', () =>
{
  let component: ChannelscomponentComponent;
  let fixture: ComponentFixture<ChannelscomponentComponent>;

  beforeEach(async () =>
  {
    await TestBed.configureTestingModule({
      declarations: [ChannelscomponentComponent]
    })
      .compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(ChannelscomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
