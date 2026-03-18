import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailMasivoComponent } from './email-masivo.component';

describe('EmailMasivoComponent', () => {
  let component: EmailMasivoComponent;
  let fixture: ComponentFixture<EmailMasivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailMasivoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailMasivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
