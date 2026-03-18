import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSurveysComponent } from './show-surveys.component';

describe('ShowSurveysComponent', () => {
  let component: ShowSurveysComponent;
  let fixture: ComponentFixture<ShowSurveysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowSurveysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowSurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
