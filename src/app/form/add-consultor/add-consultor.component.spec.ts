import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsultorComponent } from './add-consultor.component';

describe('AddConsultorComponent', () => {
  let component: AddConsultorComponent;
  let fixture: ComponentFixture<AddConsultorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConsultorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddConsultorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
