import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseQuestionsComponent } from './response-questions.component';

describe('ResponseQuestionsComponent', () => {
  let component: ResponseQuestionsComponent;
  let fixture: ComponentFixture<ResponseQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResponseQuestionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponseQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
