import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUploadPdfMultipleComponent } from './dialog-upload-pdf-multiple.component';

describe('DialogUploadPdfMultipleComponent', () => {
  let component: DialogUploadPdfMultipleComponent;
  let fixture: ComponentFixture<DialogUploadPdfMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogUploadPdfMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogUploadPdfMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
