import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileStudyComponent } from './upload-file-study.component';

describe('UploadFileStudyComponent', () => {
  let component: UploadFileStudyComponent;
  let fixture: ComponentFixture<UploadFileStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadFileStudyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFileStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
